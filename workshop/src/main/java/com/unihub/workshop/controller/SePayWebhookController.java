package com.unihub.workshop.controller;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.UserRepository;
import com.unihub.workshop.repository.WorkshopRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import com.unihub.workshop.event.TicketCreatedEvent;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class SePayWebhookController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    private final ApplicationEventPublisher eventPublisher;

    // Cập nhật Constructor để Spring Boot tự động Inject
    public SePayWebhookController(TicketRepository ticketRepository, 
                                  UserRepository userRepository, 
                                  WorkshopRepository workshopRepository,
                                  ApplicationEventPublisher eventPublisher) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
        this.eventPublisher = eventPublisher;
    }

    // Trong SePayWebhookController.java
@Transactional
@PostMapping("/sepay")
public ResponseEntity<?> handleSePayWebhook(@RequestBody Map<String, Object> payload) {
    String content = (String) payload.get("content");
    System.out.println("Nhận giao dịch: " + content);

    if (content == null) return ResponseEntity.badRequest().body("Nội dung rỗng");

    // 1. DỌN DẸP CHUỖI: Xoá sạch mọi khoảng trắng và dấu gạch ngang (nếu có)
    String normalizedContent = content.replaceAll("[\\s\\-]", "").toUpperCase();

    // 2. Tìm vị trí chữ TK
    int startIndex = normalizedContent.indexOf("TK");
    if (startIndex == -1) {
        return ResponseEntity.ok("Không phải giao dịch mua vé (bỏ qua)");
    }

    try {
        // 3. Cắt chuẩn 14 ký tự (TK + 4 User + 4 WS + 4 Random)
        // Ví dụ: Cắt từ "SHOPEEPAY...TK00050010A1B2..." -> Lấy đúng "TK00050010A1B2"
        String ticketCode = normalizedContent.substring(startIndex, startIndex + 14);

        // Kiểm tra Idempotency: Giao dịch này đã được xử lý chưa?
        if (ticketRepository.findByTicketCode(ticketCode).isPresent()) {
            System.out.println("Idempotency: Giao dịch " + ticketCode + " đã được xử lý trước đó. Bỏ qua.");
            return ResponseEntity.ok("Giao dịch đã được xử lý (Idempotent)");
        }

        // 4. Giải mã bằng cách đếm vị trí
        Long userId = Long.parseLong(ticketCode.substring(2, 6));      // Lấy 4 số tiếp theo sau "TK"
        Long workshopId = Long.parseLong(ticketCode.substring(6, 10)); // Lấy 4 số tiếp theo nữa

        User user = userRepository.findById(userId).orElseThrow();
        Workshop ws = workshopRepository.findById(workshopId).orElseThrow();

        if (ws.getBookedSpots() >= ws.getTotalSeats()) {
            System.out.println("Sự kiện đã hết vé, user ID: " + userId + " cần được hoàn tiền.");
            return ResponseEntity.badRequest().body("Sự kiện đã hết vé, cần hoàn tiền");
        }

        try {
            ws.setBookedSpots(ws.getBookedSpots() + 1);
            workshopRepository.saveAndFlush(ws);
        } catch (ObjectOptimisticLockingFailureException e) {
            System.out.println("Xung đột chỗ ngồi, user ID: " + userId + " cần được hoàn tiền.");
            return ResponseEntity.badRequest().body("Xung đột chỗ ngồi, cần hoàn tiền");
        }

        // 5. TẠO VÉ TRONG DATABASE
        Ticket ticket = new Ticket(ticketCode, user, ws, false);
        ticketRepository.save(ticket);
        
        // Gửi email xác nhận thanh toán thành công (Observer Pattern)
        eventPublisher.publishEvent(new TicketCreatedEvent(this, ticket));
        
        System.out.println("Tạo vé thành công: " + ticketCode);
        return ResponseEntity.ok("Đã cấp vé");
    } catch (Exception e) {
        System.out.println("Lỗi giải mã vé: " + e.getMessage());
        return ResponseEntity.badRequest().body("Mã vé sai định dạng hoặc bị thiếu");
    }
}
}