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
import org.springframework.security.access.prepost.PreAuthorize;
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
            case "CANCELLED" -> "Sự kiện đã hủy";
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
            if ("EXPIRED".equals(ticket.getPaymentStatus())
                    || "CANCELLED".equalsIgnoreCase(ticket.getPaymentStatus())) {
                continue;
            }

            try {
                Workshop ws = ticket.getWorkshop();
                if (ws == null) {
                    continue;
                }

                // Workshop đã bị admin hủy/xóa -> không hiển thị trong "Vé của tôi" nữa
                if ("CANCELLED".equalsIgnoreCase(ws.getStatus())) {
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
                map.put("workshopStatus", ws.getStatus());
                map.put("canCheckIn", checkInAllowed);
                map.put("qrValue", checkInAllowed ? ticket.getTicketCode() : null);

                ticketList.add(map);
            } catch (RuntimeException error) {
                System.err.println("Bỏ qua ticket lỗi khi tải Vé của tôi: " + ticket.getId() + " - " + error.getMessage());
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
            Map<String, Object> result = ticketService.registerWorkshop(workshopId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================================
    // CÁC API DÀNH CHO ADMIN/STAFF (Có @PreAuthorize ở method
    // và double-check ở SecurityConfig URL filter)
    // ==========================================================

    @GetMapping("/workshop/{workshopId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> getAttendeesByWorkshop(@PathVariable Long workshopId) {
        List<Ticket> tickets = ticketRepository.findByWorkshopIdAndPaymentStatusIn(workshopId, CHECK_IN_PAYMENT_STATUSES);

        List<Map<String, Object>> attendees = tickets.stream().map(ticket -> {
            Map<String, Object> map = new HashMap<>();
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

    @PutMapping("/{ticketId}/checkin")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> checkInTicket(@PathVariable Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé này!"));

        if (!canCheckIn(ticket)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vé chưa thanh toán nên không thể check-in."));
        }

        ticket.setScanned(true);
        ticketRepository.save(ticket);

        eventPublisher.publishEvent(new com.unihub.workshop.event.UserNotificationEvent(
            this, ticket.getUser(), "Check-in thành công",
            "Bạn đã check-in thành công vào sự kiện: " + ticket.getWorkshop().getTitle() + ". Chúc bạn tham gia vui vẻ!"
        ));

        return ResponseEntity.ok(Map.of("message", "Check-in thành công!"));
    }

    // ==========================================
    // BULK OFFLINE CHECK-IN SYNC — chỉ ADMIN/STAFF
    // ==========================================
    @PutMapping("/batch-checkin")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Transactional
    public ResponseEntity<?> batchCheckInTickets(@RequestBody List<String> ticketCodes) {
        if (ticketCodes == null || ticketCodes.isEmpty()) {
            return ResponseEntity.badRequest().body("Danh sách vé trống, không có gì để đồng bộ.");
        }

        int updatedCount = ticketRepository.checkInBatch(ticketCodes, CHECK_IN_PAYMENT_STATUSES);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đồng bộ offline thành công");
        response.put("received", ticketCodes.size());
        response.put("newlyCheckedIn", updatedCount);

        return ResponseEntity.ok(response);
    }
}
