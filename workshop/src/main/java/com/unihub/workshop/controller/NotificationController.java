package com.unihub.workshop.controller;

import com.unihub.workshop.entity.Notification;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.event.TicketCreatedEvent;
import com.unihub.workshop.repository.NotificationRepository;
import com.unihub.workshop.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Emitters cho Admin
    private final CopyOnWriteArrayList<SseEmitter> adminEmitters = new CopyOnWriteArrayList<>();
    
    // Emitters cho từng User (Key = Email)
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    public NotificationController(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // ==========================================
    // 1. SSE CHO ADMIN (GIỮ NGUYÊN)
    // ==========================================
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() {
        SseEmitter emitter = new SseEmitter(3600000L); 
        adminEmitters.add(emitter);

        emitter.onCompletion(() -> adminEmitters.remove(emitter));
        emitter.onTimeout(() -> adminEmitters.remove(emitter));
        emitter.onError((e) -> adminEmitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected to Admin Notification Stream"));
        } catch (IOException e) {
            adminEmitters.remove(emitter);
        }

        return emitter;
    }

    // ==========================================
    // 2. SSE CHO USER (NEW)
    // ==========================================
    @GetMapping(value = "/stream-user", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamUserNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized");
        }
        String email = authentication.getName();

        SseEmitter emitter = new SseEmitter(3600000L);
        userEmitters.computeIfAbsent(email, k -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable removeEmitter = () -> {
            List<SseEmitter> list = userEmitters.get(email);
            if (list != null) {
                list.remove(emitter);
                if (list.isEmpty()) {
                    userEmitters.remove(email);
                }
            }
        };

        emitter.onCompletion(removeEmitter);
        emitter.onTimeout(removeEmitter);
        emitter.onError((e) -> removeEmitter.run());

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected to User Notification Stream"));
        } catch (IOException e) {
            removeEmitter.run();
        }

        return emitter;
    }

    // ==========================================
    // 3. API LẤY THÔNG BÁO CỦA USER
    // ==========================================
    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(notifications);
    }

    // ==========================================
    // 4. API ĐÁNH DẤU ĐÃ ĐỌC
    // ==========================================
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ==========================================
    // 5. GỬI PUSH NOTIFICATION (UTILITY METHOD)
    // ==========================================
    public void sendPushNotification(User user, String title, String message) {
        // Lưu vào DB
        Notification notif = new Notification(user, title, message);
        notificationRepository.save(notif);

        // Đẩy qua SSE nếu user đang online
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(user.getEmail());
        if (emitters != null) {
            String jsonPayload = String.format("{\"id\": %d, \"title\": \"%s\", \"message\": \"%s\", \"createdAt\": \"%s\"}", 
                    notif.getId(), notif.getTitle(), notif.getMessage(), notif.getCreatedAt().toString());
            
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("NEW_NOTIFICATION").data(jsonPayload));
                } catch (IOException e) {
                    emitters.remove(emitter);
                }
            }
        }
    }

    // ==========================================
    // 6. EVENT LISTENER (Giữ nguyên cho Admin, có thể thêm cho user nếu cần)
    // ==========================================
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onTicketCreated(TicketCreatedEvent event) {
        String studentName = event.getTicket().getUser().getFullName();
        String workshopTitle = event.getTicket().getWorkshop().getTitle();
        
        // Báo cho Admin
        String message = String.format("{\"type\": \"NEW_REGISTRATION\", \"message\": \"Sinh viên %s vừa đăng ký vé cho sự kiện %s\"}", 
            studentName != null ? studentName : "Ẩn danh", workshopTitle);
            
        for (SseEmitter emitter : adminEmitters) {
            try {
                emitter.send(SseEmitter.event().name("NEW_REGISTRATION").data(message));
            } catch (IOException e) {
                adminEmitters.remove(emitter);
            }
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onUserNotification(com.unihub.workshop.event.UserNotificationEvent event) {
        sendPushNotification(event.getUser(), event.getTitle(), event.getMessage());
    }
}
