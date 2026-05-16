package com.unihub.workshop.service.notification;

import com.unihub.workshop.entity.Notification;
import com.unihub.workshop.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationSseService {

    private final CopyOnWriteArrayList<SseEmitter> adminEmitters = new CopyOnWriteArrayList<>();
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    public SseEmitter registerAdminEmitter() {
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

    public SseEmitter registerUserEmitter(String email) {
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

    public void sendUserNotification(User user, Notification notification) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(user.getEmail());
        if (emitters == null) {
            return;
        }

        String jsonPayload = String.format("{\"id\": %d, \"title\": \"%s\", \"message\": \"%s\", \"createdAt\": \"%s\"}",
                notification.getId(), notification.getTitle(), notification.getMessage(), notification.getCreatedAt().toString());

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("NEW_NOTIFICATION").data(jsonPayload));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }

    public void sendAdminRegistration(String studentName, String workshopTitle) {
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
}
