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
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Kiểm tra user đã đăng ký workshop này chưa
    public boolean isUserRegistered(Long workshopId) {
        User user = getCurrentUser();
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Workshop not found"));
        return ticketRepository.existsByUserAndWorkshop(user, workshop);
    }

    // Xử lý đăng ký
    public String registerWorkshop(Long workshopId) {
        User user = getCurrentUser();
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Workshop not found"));

        if (ticketRepository.existsByUserAndWorkshop(user, workshop)) {
            throw new RuntimeException("Bạn đã đăng ký workshop này rồi!");
        }

        // Tạo mã vé ngẫu nhiên (Ví dụ: TK-1A2B3C)
        String ticketCode = "TK-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // Kiểm tra workshop miễn phí hay có phí
        if (workshop.getPrice() == null || workshop.getPrice() == 0) {
            // Nếu MIỄN PHÍ -> Tạo vé luôn với trạng thái PAID
            Ticket ticket = new Ticket(ticketCode, user, workshop, "PAID", false);
            ticketRepository.save(ticket);
            return "FREE_SUCCESS";
        } else {
            // Nếu CÓ PHÍ -> Báo về Frontend để mở Modal thanh toán (Chưa lưu vé)
            return "REQUIRE_PAYMENT";
        }
    }
}