package com.unihub.workshop.controller;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.UserRepository;
import com.unihub.workshop.service.TicketService;

import jakarta.transaction.Transactional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketService ticketService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public TicketController(TicketRepository ticketRepository, UserRepository userRepository, TicketService ticketService, org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketService = ticketService;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping("/status/{ticketCode}")
    public ResponseEntity<Map<String, String>> checkPaymentStatus(@PathVariable String ticketCode) {
        String status = ticketService.checkTicketStatus(ticketCode);
        return ResponseEntity.ok(Map.of("status", status));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<List<Map<String, Object>>> getMyTickets() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Ticket> tickets = ticketRepository.findByUser(user);
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        List<Map<String, Object>> ticketList = tickets.stream().map(ticket -> {
        
            Workshop ws = ticket.getWorkshop();
            Map<String, Object> map = new HashMap<>();
            
            // ĐÃ SỬA: Vé nằm trong DB là "Đã xác nhận", nếu quét QR check-in rồi thì "Đã tham gia"
            String status = ticket.isScanned() ? "Đã tham gia" : "Đã xác nhận";

            // Map chính xác với các biến bên MyTickets.jsx
            map.put("workshopId", ws.getId());
            map.put("id", ticket.getTicketCode()); 
            map.put("title", ws.getTitle());
            map.put("speaker", ws.getSpeaker());
            map.put("room", ws.getRoom());
            map.put("date", ws.getEventDate() != null ? ws.getEventDate().format(dateFormatter) : "---");
            map.put("time", ws.getStartTime() != null ? ws.getStartTime().format(timeFormatter) : "---");
            map.put("status", status);
            map.put("qrValue", ticket.getTicketCode()); // Dùng mã vé làm QR Code

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ticketList);
    }

    @GetMapping("/check-registration/{workshopId}")
    public ResponseEntity<?> checkRegistration(@PathVariable Long workshopId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        boolean isRegistered = ticketRepository.existsByUserIdAndWorkshopId(currentUser.getId(), workshopId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isRegistered", isRegistered);
        return ResponseEntity.ok(response);
        
    }

    @PostMapping("/register/{workshopId}")
    public ResponseEntity<Map<String, Object>> registerWorkshop(@PathVariable Long workshopId) {
        try {
            // Gọi service và nhận về Map chứa status, qrUrl, memo...
            Map<String, Object> result = ticketService.registerWorkshop(workshopId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            // Trả về lỗi dưới dạng JSON để Frontend dễ xử lý
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================================
    // CÁC API DÀNH CHO ADMIN (QUẢN LÝ DANH SÁCH & CHECK-IN)
    // ==========================================================

    // 1. Lấy danh sách người tham dự của một Workshop
    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<?> getAttendeesByWorkshop(@PathVariable Long workshopId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean hasPermission = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));
        if (!hasPermission) {
            return ResponseEntity.status(403).body("Bạn không có quyền truy cập danh sách này!");
        }
        List<Ticket> tickets = ticketRepository.findByWorkshopId(workshopId);
        
        // Map dữ liệu Ticket ra định dạng JSON giống y hệt React đang cần
        List<java.util.Map<String, Object>> attendees = tickets.stream().map(ticket -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", ticket.getId());
            map.put("ticketCode", ticket.getTicketCode());
            map.put("name", ticket.getUser() != null ? ticket.getUser().getFullName() : "Khách ẩn danh");
            map.put("studentId", ticket.getUser() != null ? ticket.getUser().getStudentId() : "");
            map.put("faculty", ticket.getUser() != null ? ticket.getUser().getFaculty() : "");
            map.put("paymentStatus", ticket.getPaymentStatus());
            map.put("isCheckedIn", Boolean.TRUE.equals(ticket.isScanned()));
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(attendees);
    }

    // 2. Check-in thủ công
    @PutMapping("/{ticketId}/checkin")
    public ResponseEntity<?> checkInTicket(@PathVariable Long ticketId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean hasPermission = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));
        if (!hasPermission) {
            return ResponseEntity.status(403).body("Bạn không có quyền check-in sinh viên!");
        }
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé này!"));
        
        ticket.setScanned(true); // Đánh dấu đã tham gia
        ticketRepository.save(ticket);
        
        // Gửi Push Notification cho User báo đã check-in thành công
        eventPublisher.publishEvent(new com.unihub.workshop.event.UserNotificationEvent(
            this, ticket.getUser(), "Check-in thành công", "Bạn đã check-in thành công vào sự kiện: " + ticket.getWorkshop().getTitle() + ". Chúc bạn tham gia vui vẻ!"
        ));
        
        return ResponseEntity.ok(java.util.Map.of("message", "Check-in thành công!"));
    }
    // ==========================================
    // ENHANCEMENT 4: BULK OFFLINE CHECK-IN SYNC
    // ==========================================
    @PutMapping("/batch-checkin")
    @Transactional
    public ResponseEntity<?> batchCheckInTickets(@RequestBody List<String> ticketCodes) {
        if (ticketCodes == null || ticketCodes.isEmpty()) {
            return ResponseEntity.badRequest().body("Danh sách vé trống, không có gì để đồng bộ.");
        }

        // Thực thi Update hàng loạt xuống thẳng Database
        int updatedCount = ticketRepository.checkInBatch(ticketCodes);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đồng bộ offline thành công");
        response.put("received", ticketCodes.size());
        response.put("newlyCheckedIn", updatedCount);

        return ResponseEntity.ok(response);
    }


}
