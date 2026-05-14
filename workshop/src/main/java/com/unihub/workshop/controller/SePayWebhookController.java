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

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class SePayWebhookController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;

    // Cập nhật Constructor để Spring Boot tự động Inject cả 3 Repository
    public SePayWebhookController(TicketRepository ticketRepository, 
                                  UserRepository userRepository, 
                                  WorkshopRepository workshopRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
    }

    // Trong SePayWebhookController.java
    @Transactional
    @PostMapping("/sepay")
    public ResponseEntity<?> handleSePayWebhook(@RequestBody Map<String, Object> payload) {
        try{
            String ticketCode = (String) payload.get("content");

            if (ticketCode == null || !ticketCode.startsWith("TK")) {
                return ResponseEntity.badRequest().body("Nội dung chuyển khoản không hợp lệ");
            }

            if(ticketRepository.findByTicketCode(ticketCode).isPresent()){
                System.out.println("Webhook retry detected! Ticket " + ticketCode + " already exists. Ignored.");
                return ResponseEntity.ok("Giao dịch đã được xử lý trước đó");
            }

            Long userId = Long.parseLong(ticketCode.substring(2, 6));      // Lấy 4 số tiếp theo sau "TK"
            Long workshopId = Long.parseLong(ticketCode.substring(6, 10)); // Lấy 4 số tiếp theo nữa

            User user = userRepository.findById(userId).orElseThrow();
            Workshop ws = workshopRepository.findById(workshopId).orElseThrow();

            if(ws.getBookedSpots() >= ws.getTotalSeats()){
                System.out.println("Sự kiện hết vé, user ID: " + userId + " cần thực hiện hoàn tiền");
                return ResponseEntity.badRequest().body("Sự kiện hết vé, cần hoàn tiền");
            }

            int updatedRows = workshopRepository.incrementSeatIfAvailable(workshopId);
            if(updatedRows == 0){
                System.out.println("Xung đột chỗ ngồi hoặc hết vé, user ID: " + userId + " cần được hoàn tiền qua SePay");
                return ResponseEntity.badRequest().body("Xung đột chỗ ngồi, cần hoàn tiền");
            }

            Ticket ticket = new Ticket(ticketCode, user, ws, false);
            ticketRepository.save(ticket);

            System.out.println("Tạo vé thành công " + ticketCode );
            return ResponseEntity.ok("Đã cấp vé");

        }catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi hệ thống khi xử lý webhook");
        }  
    }
}