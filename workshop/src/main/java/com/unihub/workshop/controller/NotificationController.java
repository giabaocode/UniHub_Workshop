package com.unihub.workshop.controller;

import com.unihub.workshop.entity.Notification;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.event.TicketCreatedEvent;
import com.unihub.workshop.repository.NotificationRepository;
import com.unihub.workshop.repository.UserRepository;
import com.unihub.workshop.service.notification.NotificationSseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationSseService notificationSseService;

    public NotificationController(NotificationRepository notificationRepository,
                                  UserRepository userRepository,
                                  NotificationSseService notificationSseService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationSseService = notificationSseService;
    }

    // ==========================================
    // 1. SSE CHO ADMIN — chỉ ADMIN mới được mở stream
    //    (ngoài @PreAuthorize, SecurityConfig cũng đã chặn ở filter chain)
    // ==========================================
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public SseEmitter streamNotifications() {
        return notificationSseService.registerAdminEmitter();
    }

    // ==========================================
    // 2. SSE CHO USER (đã đăng nhập)
    // ==========================================
    @GetMapping(value = "/stream-user", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamUserNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập.");
        }
        String email = authentication.getName();
        return notificationSseService.registerUserEmitter(email);
    }

    // ==========================================
    // 3. API LẤY THÔNG BÁO CỦA USER
    // ==========================================
    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications() {
        User user = currentUser();
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(notifications);
    }

    // ==========================================
    // 4. API ĐÁNH DẤU ĐÃ ĐỌC — kiểm tra notification có thực sự thuộc user hiện tại không
    // ==========================================
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        User user = currentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo."));

        if (notification.getUser() == null || !notification.getUser().getId().equals(user.getId())) {
            // Tránh lộ chi tiết: trả 404 thay vì 403 để ko cho dò ID
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        User user = currentUser();
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ==========================================
    // 5. EVENT LISTENER CHO ADMIN SSE
    // ==========================================
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onTicketCreated(TicketCreatedEvent event) {
        String studentName = event.getTicket().getUser().getFullName();
        String workshopTitle = event.getTicket().getWorkshop().getTitle();
        notificationSseService.sendAdminRegistration(studentName, workshopTitle);
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ."));
    }
}
