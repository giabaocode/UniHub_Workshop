package com.unihub.workshop.controller;

import com.unihub.workshop.controller.dto.TicketDto;
import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketController(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<List<TicketDto>> getMyTickets() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        User user = userRepository.findByEmail(currentPrincipalName)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Ticket> tickets = ticketRepository.findByUser(user);

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        List<TicketDto> ticketDtos = tickets.stream().map(ticket -> {
            Workshop workshop = ticket.getWorkshop();
            String status = determineStatus(ticket);
            
            String dateStr = workshop.getEventDate() != null ? workshop.getEventDate().format(dateFormatter) : "";
            String timeStr = workshop.getStartTime() != null 
                ? workshop.getStartTime().format(timeFormatter)
                : "";

            return new TicketDto(
                    ticket.getTicketCode(),
                    workshop.getTitle(),
                    workshop.getSpeaker(),
                    dateStr,
                    timeStr,
                    workshop.getRoom(),
                    status,
                    ticket.getTicketCode()
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ticketDtos);
    }

    private String determineStatus(Ticket ticket) {
        if (Boolean.TRUE.equals(ticket.getCheckInStatus())) {
            return "Đã tham gia";
        }
        if ("PAID".equalsIgnoreCase(ticket.getPaymentStatus())) {
            return "Đã xác nhận";
        }
        return "Chờ thanh toán";
    }


    // ==========================================================
    // CÁC API DÀNH CHO ADMIN (QUẢN LÝ DANH SÁCH & CHECK-IN)
    // ==========================================================

    // 1. Lấy danh sách người tham dự của một Workshop
    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<?> getAttendeesByWorkshop(@PathVariable Long workshopId) {
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
            map.put("isCheckedIn", Boolean.TRUE.equals(ticket.getCheckInStatus()));
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(attendees);
    }

    // 2. Check-in thủ công
    @PutMapping("/{ticketId}/checkin")
    public ResponseEntity<?> checkInTicket(@PathVariable Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé này!"));
        
        ticket.setCheckInStatus(true); // Đánh dấu đã tham gia
        ticketRepository.save(ticket);
        
        return ResponseEntity.ok(java.util.Map.of("message", "Check-in thành công!"));
    }
}
