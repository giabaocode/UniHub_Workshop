package com.unihub.workshop.controller;

import com.unihub.workshop.event.TicketCreatedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class NotificationController {

    // Danh sách các kết nối SSE hiện tại (Dành cho Admin đang online)
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() {
        // Giới hạn timeout 1 tiếng (3600000 ms)
        SseEmitter emitter = new SseEmitter(3600000L); 
        emitters.add(emitter);

        // Xoá Emitter khỏi danh sách khi kết nối ngắt
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        // Gửi sự kiện INIT để khởi tạo kết nối ngay lập tức
        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected to Notification Stream"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    // Lắng nghe sự kiện TicketCreatedEvent được bắn ra từ TicketService / SePayWebhookController
    @EventListener
    public void onTicketCreated(TicketCreatedEvent event) {
        String studentName = event.getTicket().getUser().getFullName();
        String workshopTitle = event.getTicket().getWorkshop().getTitle();
        
        // Tạo chuỗi JSON đơn giản hoặc chỉ cần gửi string
        String message = String.format("{\"type\": \"NEW_REGISTRATION\", \"message\": \"Sinh viên %s vừa đăng ký vé cho sự kiện %s\"}", 
            studentName != null ? studentName : "Ẩn danh", 
            workshopTitle);
            
        // Gửi thông báo đến tất cả các Admin đang kết nối
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("NEW_REGISTRATION").data(message));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}
