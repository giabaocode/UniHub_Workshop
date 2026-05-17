package com.unihub.workshop.controller;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.entity.RefundLog;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.UserRepository;
import com.unihub.workshop.repository.WorkshopRepository;
import com.unihub.workshop.repository.RefundLogRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import com.unihub.workshop.event.TicketCreatedEvent;
import com.unihub.workshop.event.WorkshopSeatChangedEvent;
import com.unihub.workshop.service.notification.UserNotificationService;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@CrossOrigin(origins = "http://localhost:5173")
public class SePayWebhookController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final RefundLogRepository refundLogRepository;
    private final UserNotificationService userNotificationService;

    public SePayWebhookController(TicketRepository ticketRepository, 
                                  UserRepository userRepository, 
                                  WorkshopRepository workshopRepository,
                                  ApplicationEventPublisher eventPublisher,
                                  RefundLogRepository refundLogRepository,
                                  UserNotificationService userNotificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
        this.eventPublisher = eventPublisher;
        this.refundLogRepository = refundLogRepository;
        this.userNotificationService = userNotificationService;
    }

    @Transactional
    @PostMapping("/sepay")
    public ResponseEntity<?> handleSePayWebhook(@RequestBody Map<String, Object> payload) {
        String content = (String) payload.get("content");
        System.out.println("Nhận giao dịch: " + content);

        if (content == null) return ResponseEntity.badRequest().body("Nội dung rỗng");

        String normalizedContent = content.replaceAll("[\\s\\-]", "").toUpperCase();
        int startIndex = normalizedContent.indexOf("TK");
        if (startIndex == -1) {
            return ResponseEntity.ok("Không phải giao dịch mua vé (bỏ qua)");
        }

        try {
            String ticketCode = normalizedContent.substring(startIndex, startIndex + 14);

            Double amountReceived = null;
            if (payload.get("transferAmount") != null) {
                try {
                    amountReceived = Double.parseDouble(payload.get("transferAmount").toString());
                } catch (NumberFormatException ignored) {}
            }

            Ticket ticket = ticketRepository.findByTicketCode(ticketCode).orElse(null);
            
            if (ticket == null) {
                System.out.println("Giao dịch chứa mã vé không tồn tại: " + ticketCode);
                refundLogRepository.save(new RefundLog(ticketCode, amountReceived, "Mã vé không tồn tại (có thể bị xoá hoặc sai mã)"));
                return ResponseEntity.badRequest().body("Mã vé không tồn tại");
            }

            if ("PAID".equals(ticket.getPaymentStatus())) {
                System.out.println("Idempotency: Giao dịch " + ticketCode + " đã được xử lý trước đó (PAID). Bỏ qua.");
                return ResponseEntity.ok("Giao dịch đã được xử lý (Idempotent)");
            }

            if ("EXPIRED".equals(ticket.getPaymentStatus())) {
                System.out.println("Vé " + ticketCode + " đã EXPIRED. Cố gắng giành lại ghế...");
                int updatedRows = workshopRepository.incrementSeatIfAvailable(ticket.getWorkshop().getId());
                if (updatedRows > 0) {
                    System.out.println("May quá vẫn còn ghế! Hồi sinh vé " + ticketCode);
                    ticket.setPaymentStatus("PAID");
                    ticketRepository.save(ticket);
                    eventPublisher.publishEvent(new TicketCreatedEvent(this, ticket));
                    eventPublisher.publishEvent(new WorkshopSeatChangedEvent(this, ticket.getWorkshop().getId()));
                    userNotificationService.notifyUser(
                            ticket.getUser(),
                            "Thanh toán thành công",
                            "Bạn đã mua thành công vé sự kiện: " + ticket.getWorkshop().getTitle()
                    );
                    return ResponseEntity.ok("Đã cấp lại vé thành công");
                } else {
                    System.out.println("Sự kiện đã hết vé, user chuyển khoản quá muộn.");
                    refundLogRepository.save(new RefundLog(ticketCode, amountReceived, "Chuyển khoản muộn sau khi vé hết hạn (15 phút), sự kiện đã kín chỗ."));
                    return ResponseEntity.badRequest().body("Sự kiện đã hết vé, cần hoàn tiền");
                }
            }

            if ("PENDING".equals(ticket.getPaymentStatus())) {
                System.out.println("Thanh toán thành công cho vé PENDING: " + ticketCode);
                ticket.setPaymentStatus("PAID");
                ticketRepository.save(ticket);
                eventPublisher.publishEvent(new TicketCreatedEvent(this, ticket));
                userNotificationService.notifyUser(
                        ticket.getUser(),
                        "Thanh toán thành công",
                        "Bạn đã mua thành công vé sự kiện: " + ticket.getWorkshop().getTitle()
                );
                return ResponseEntity.ok("Đã cấp vé");
            }

            return ResponseEntity.ok("Trạng thái vé không hợp lệ");
            
        } catch (DataIntegrityViolationException e) {
            // Xảy ra khi 2 luồng cùng lúc insert trùng ticketCode
            System.out.println("Bắt lỗi Unique Constraint: " + e.getMessage());
            return ResponseEntity.ok("Giao dịch đã được xử lý (Bắt lỗi Unique Constraint)");
        } catch (Exception e) {
            System.out.println("Lỗi giải mã vé: " + e.getMessage());
            return ResponseEntity.badRequest().body("Mã vé sai định dạng hoặc bị thiếu");
        }
    }
}
