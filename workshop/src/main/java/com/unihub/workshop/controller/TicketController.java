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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
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
}
