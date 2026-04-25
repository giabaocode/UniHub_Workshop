package com.unihub.workshop.service;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.UserRepository;
import com.unihub.workshop.repository.WorkshopRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository, WorkshopRepository workshopRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Người dùng chưa đăng nhập"));
    }

    public boolean isUserRegistered(Long workshopId) {
        User user = getCurrentUser();
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Workshop"));
        return ticketRepository.existsByUserAndWorkshop(user, workshop);
    }

    public String registerWorkshop(Long workshopId) {
        User user = getCurrentUser();
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Workshop"));

        if (ticketRepository.existsByUserAndWorkshop(user, workshop)) {
            throw new RuntimeException("Bạn đã đăng ký sự kiện này rồi!");
        }

        String ticketCode = "TK-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        if (workshop.getPrice() == null || workshop.getPrice() == 0) {
            Ticket ticket = new Ticket();
            ticket.setTicketCode(ticketCode);
            ticket.setUser(user);
            ticket.setWorkshop(workshop);
            ticket.setPaymentStatus("PAID");
            ticket.setCheckInStatus(false);
            ticketRepository.save(ticket);
            return "FREE_SUCCESS";
        } else {
            return "REQUIRE_PAYMENT";
        }
    }
}