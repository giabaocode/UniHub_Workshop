package com.unihub.workshop.controller;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.UserRepository;
import com.unihub.workshop.service.TicketService;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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

    private static final List<String> CHECK_IN_PAYMENT_STATUSES = List.of("PAID", "PAY_AT_COUNTER");

    private boolean canCheckIn(Ticket ticket) {
        return CHECK_IN_PAYMENT_STATUSES.contains(ticket.getPaymentStatus());
    }

    private String getTicketStatusLabel(Ticket ticket) {
        if (ticket.isScanned()) {
            return "Đã tham gia";
        }
        String paymentStatus = ticket.getPaymentStatus();
        if (paymentStatus == null) {
            return "Chưa xác nhận";
        }
        return switch (paymentStatus) {
            case "PAID" -> "Đã xác nhận";
            case "PAY_AT_COUNTER" -> "Thanh toán tại quầy";
            case "PENDING" -> "Chờ thanh toán";
            default -> "Chưa xác nhận";
        };
    }

    @GetMapping("/status/{ticketCode}")
    public ResponseEntity<Map<String, String>> checkPaymentStatus(@PathVariable String ticketCode) {
        String status = ticketService.checkTicketStatus(ticketCode);
        return ResponseEntity.ok(Map.of("status", status));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<?> getMyTickets() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để xem vé."));
        }

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại."));
        }

        List<Ticket> tickets = ticketRepository.findByUserWithWorkshop(user);
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        List<Map<String, Object>> ticketList = new ArrayList<>();
        for (Ticket ticket : tickets) {
            if ("EXPIRED".equals(ticket.getPaymentStatus())) {
                continue;
            }

            try {
                Workshop ws = ticket.getWorkshop();
                if (ws == null) {
                    continue;
                }

                Map<String, Object> map = new HashMap<>();
                boolean checkInAllowed = canCheckIn(ticket);

                map.put("workshopId", ws.getId());
                map.put("id", ticket.getTicketCode());
                map.put("title", ws.getTitle());
                map.put("speaker", ws.getSpeaker());
                map.put("room", ws.getRoom());
                map.put("date", ws.getEventDate() != null ? ws.getEventDate().format(dateFormatter) : "---");
                map.put("time", ws.getStartTime() != null ? ws.getStartTime().format(timeFormatter) : "---");
                map.put("status", getTicketStatusLabel(ticket));
                map.put("paymentStatus", ticket.getPaymentStatus());
                map.put("canCheckIn", checkInAllowed);
                map.put("qrValue", checkInAllowed ? ticket.getTicketCode() : null);

                ticketList.add(map);
            } catch (RuntimeException error) {
                System.err.println("Bỏ qua ticket lỗi khi tải Vé của tôi: " + ticket.getId() + " - " + error.getMessage());
                continue;
            }
        }

        return ResponseEntity.ok(ticketList);
    }

    @GetMapping("/check-registration/{workshopId}")
    public ResponseEntity<?> checkRegistration(@PathVariable Long workshopId) {
        return ResponseEntity.ok(ticketService.getRegistrationStatus(workshopId));
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
        List<Ticket> tickets = ticketRepository.findByWorkshopIdAndPaymentStatusIn(workshopId, CHECK_IN_PAYMENT_STATUSES);
        
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

        if (!canCheckIn(ticket)) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Vé chưa thanh toán nên không thể check-in."));
        }
        
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
        int updatedCount = ticketRepository.checkInBatch(ticketCodes, CHECK_IN_PAYMENT_STATUSES);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đồng bộ offline thành công");
        response.put("received", ticketCodes.size());
        response.put("newlyCheckedIn", updatedCount);

        return ResponseEntity.ok(response);
    }


}
