package com.unihub.workshop.controller;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.UserRepository;
import com.unihub.workshop.service.TicketService;
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

    public TicketController(TicketRepository ticketRepository, UserRepository userRepository, TicketService ticketService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketService = ticketService;
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
            
            String status = "Chờ thanh toán";
            if (Boolean.TRUE.equals(ticket.getCheckInStatus())) status = "Đã tham gia";
            else if ("PAID".equalsIgnoreCase(ticket.getPaymentStatus())) status = "Đã xác nhận";

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
    public ResponseEntity<Map<String, Boolean>> checkRegistration(@PathVariable Long workshopId) {
        boolean isRegistered = ticketService.isUserRegistered(workshopId);
        return ResponseEntity.ok(Map.of("isRegistered", isRegistered));
    }

    // Sửa lại API đăng ký trong TicketController.java
@PostMapping("/register/{workshopId}")
public ResponseEntity<?> registerWorkshop(@PathVariable Long workshopId) {
    try {
        String result = ticketService.registerWorkshop(workshopId);
        
        // ĐÚNG: Luôn trả về Map.of để nó biến thành {"status": "FREE_SUCCESS"}
        return ResponseEntity.ok(Map.of("status", result)); 
        
    } catch (RuntimeException e) {
        // ĐÚNG: Trả về Map.of cho lỗi {"error": "..."}
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
}