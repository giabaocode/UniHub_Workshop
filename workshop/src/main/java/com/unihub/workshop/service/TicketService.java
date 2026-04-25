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

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    
    public String checkTicketStatus(String ticketCode) {
    Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy vé"));
    return "PAID";
}

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
    Workshop workshop = workshopRepository.findById(workshopId).orElseThrow();
    
    // Cực kỳ đơn giản: Có trong DB = Đã mua, Không có = Chưa mua
    return ticketRepository.existsByUserAndWorkshop(user, workshop);
}
    public Map<String, Object> registerWorkshop(Long workshopId) {
    User user = getCurrentUser();
    Workshop workshop = workshopRepository.findById(workshopId).orElseThrow();

    if (isUserRegistered(workshopId)) {
        throw new RuntimeException("Bạn đã sở hữu vé cho sự kiện này!");
    }

    // Tạo mã định danh ngụy trang: TK-{UserID}-{WorkshopID}-{Random}
   String randomStr = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    String ticketCode = String.format("TK%04d%04d%s", user.getId(), workshop.getId(), randomStr);
    
    Map<String, Object> response = new HashMap<>();

    if (workshop.getPrice() == null || workshop.getPrice() == 0) {
        // Vé MIỄN PHÍ: Tạo và lưu luôn
        Ticket ticket = new Ticket(ticketCode, user, workshop, false);
        ticketRepository.save(ticket);
        response.put("status", "FREE_SUCCESS");
    } else {
        // Vé CÓ PHÍ: CHỈ trả về thông tin quét QR, KHÔNG LƯU VÀO DB!
        String qrUrl = String.format(
            "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
            "0396660219", "MBBank", workshop.getPrice().intValue(), ticketCode
        );

        response.put("status", "REQUIRE_PAYMENT");
        response.put("amount", workshop.getPrice());
        response.put("memo", ticketCode);
        response.put("qrUrl", qrUrl);
    }
    return response;
}
}