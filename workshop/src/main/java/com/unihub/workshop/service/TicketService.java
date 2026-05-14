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
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;

    // 1. CONSTRUCTOR LUÔN NẰM TRÊN CÙNG
    public TicketService(TicketRepository ticketRepository, UserRepository userRepository, WorkshopRepository workshopRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
    }

    // 2. HÀM DÙNG CHUNG (PRIVATE)
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Người dùng chưa đăng nhập hoặc phiên đã hết hạn."));
    }

    // 3. KIỂM TRA ĐÃ CÓ VÉ CHƯA
    public boolean isUserRegistered(Long workshopId) {
        User user = getCurrentUser();
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Workshop với ID: " + workshopId));
        
        // Có trong DB = Đã mua, Không có = Chưa mua
        return ticketRepository.existsByUserAndWorkshop(user, workshop);
    }

    // 4. KIỂM TRA TRẠNG THÁI VÉ (Dành cho API Frontend gọi thăm dò)
    public String checkTicketStatus(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé: " + ticketCode));
        return "PAID"; // Cứ có vé trong DB là mặc định "PAID"
    }

    // 5. ĐĂNG KÝ VÉ VÀ TẠO QR
    @Transactional
    public Map<String, Object> registerWorkshop(Long workshopId) {
        User user = getCurrentUser();
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Workshop với ID: " + workshopId));

        if (isUserRegistered(workshopId)) {
            throw new RuntimeException("Bạn đã sở hữu vé cho sự kiện này!");
        }

        if (workshop.getBookedSpots() >= workshop.getTotalSeats()) {
            throw new RuntimeException("Rất tiếc, sự kiện này đã hết vé!");
        }

        // Tạo mã định danh ngụy trang: TK + 4 số UserID + 4 số WorkshopID + 4 chữ Random
        String randomStr = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String ticketCode = String.format("TK%04d%04d%s", user.getId(), workshop.getId(), randomStr);
        
        Map<String, Object> response = new HashMap<>();

        if (workshop.getPrice() == null || workshop.getPrice() == 0) {
           int updatedRows = workshopRepository.incrementSeatIfAvailable(workshop.getId());
           if(updatedRows == 0){
                throw new RuntimeException("Rất tiếc! Sự kiến đã hết vé hoặc vé cuối cùng vừa được đăng ký");
           }
            // Vé MIỄN PHÍ: Tạo và lưu luôn. 
            // Lưu ý: Sử dụng constructor 4 tham số từ Ticket
            Ticket ticket = new Ticket(ticketCode, user, workshop, false);
            ticketRepository.save(ticket);
            
            response.put("status", "FREE_SUCCESS");
            response.put("ticketCode", ticketCode);
        } else {
            // Vé CÓ PHÍ: CHỈ trả về thông tin quét QR, KHÔNG LƯU VÀO DB!
            String qrUrl = String.format(
                "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
                "0396660219", "MBBank", workshop.getPrice().intValue(), ticketCode
            );

            response.put("status", "REQUIRE_PAYMENT");
            response.put("amount", workshop.getPrice());
            // Frontend sẽ dùng memo (nội dung chuyển khoản) làm mã vé sau khi thanh toán thành công
            response.put("memo", ticketCode); 
            response.put("qrUrl", qrUrl);
        }
        return response;
    }
}