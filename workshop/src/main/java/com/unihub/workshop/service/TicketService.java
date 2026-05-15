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
import java.time.LocalDateTime;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import com.unihub.workshop.event.TicketCreatedEvent;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    private final ApplicationEventPublisher eventPublisher;

    // 1. CONSTRUCTOR LUÔN NẰM TRÊN CÙNG
    public TicketService(TicketRepository ticketRepository, UserRepository userRepository, WorkshopRepository workshopRepository, ApplicationEventPublisher eventPublisher) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
        this.eventPublisher = eventPublisher;
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
        // NẾU vé đã bị huỷ do quá hạn (EXPIRED), cho phép đăng ký lại
        return ticketRepository.findByUserAndWorkshop(user, workshop)
                .map(t -> !t.getPaymentStatus().equals("EXPIRED"))
                .orElse(false);
    }

    // 4. KIỂM TRA TRẠNG THÁI VÉ (Dành cho API Frontend gọi thăm dò)
    public String checkTicketStatus(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé: " + ticketCode));
        return ticket.getPaymentStatus();
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
        // Khóa ghế (Seat Hold) NGAY LẬP TỨC cho mọi loại vé
        int updatedRows = workshopRepository.incrementSeatIfAvailable(workshop.getId());
        if (updatedRows == 0) {
            throw new RuntimeException("Rất tiếc! Sự kiện đã hết vé hoặc vé cuối cùng vừa được đăng ký");
        }

        Map<String, Object> response = new HashMap<>();

        // NẾU SINH VIÊN ĐĂNG KÝ LẠI VÉ ĐÃ EXPIRED, TÁI SỬ DỤNG VÉ CŨ THAY VÌ TẠO MỚI (để tránh lỗi Unique Constraint)
        Ticket ticket = ticketRepository.findByUserAndWorkshop(user, workshop).orElse(null);
        if (ticket == null) {
            ticket = new Ticket(ticketCode, user, workshop, false);
        } else {
            // Lấy lại mã vé cũ để generate QR
            ticketCode = ticket.getTicketCode();
            ticket.setCreatedAt(LocalDateTime.now()); // Reset lại thời gian đếm ngược 15 phút
        }

        if (workshop.getPrice() == null || workshop.getPrice() == 0) {
            // Vé MIỄN PHÍ: Trạng thái PAID
            ticket.setPaymentStatus("PAID");
            ticketRepository.save(ticket);
            
            // Phát sự kiện để gửi Email
            eventPublisher.publishEvent(new TicketCreatedEvent(this, ticket));
            
            response.put("status", "FREE_SUCCESS");
            response.put("ticketCode", ticketCode);
        } else {
            // Vé CÓ PHÍ: Gọi qua Circuit Breaker
            String qrUrl = generatePaymentUrl(ticketCode, workshop.getPrice());
            
            if ("PAY_AT_COUNTER".equals(qrUrl)) {
                // Graceful Degradation: Thanh toán tại quầy
                ticket.setPaymentStatus("PAY_AT_COUNTER");
                ticketRepository.save(ticket);

                eventPublisher.publishEvent(new TicketCreatedEvent(this, ticket));

                response.put("status", "PAY_AT_COUNTER");
                response.put("message", "Cổng thanh toán bảo trì. Bạn đã được giữ chỗ, vui lòng thanh toán tại sự kiện!");
                response.put("ticketCode", ticketCode);
            } else {
                // TẠO VÉ PENDING ĐỂ GIỮ CHỖ VÀ ĐỢI WEBHOOK
                ticket.setPaymentStatus("PENDING");
                ticketRepository.save(ticket);

                response.put("status", "REQUIRE_PAYMENT");
                response.put("amount", workshop.getPrice());
                response.put("memo", ticketCode); 
                response.put("qrUrl", qrUrl);
            }
        }
        return response;
    }

    @CircuitBreaker(name = "sepay", fallbackMethod = "fallbackPaymentGateway")
    public String generatePaymentUrl(String ticketCode, Double price) {
        RestTemplate restTemplate = new RestTemplate();
        String url = String.format("https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
                "0396660219", "MBBank", price.intValue(), ticketCode);
        
        // Gọi HTTP thật để kiểm tra cổng thanh toán
        ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);
        if (response.getStatusCode().is2xxSuccessful()) {
            return url;
        }
        
        // Nếu API trả về lỗi nhưng không văng Exception (VD: 404, 500)
        // Chúng ta cố tình THROW Exception để Resilience4j tự động đếm lỗi
        throw new RuntimeException("Cổng thanh toán trả về lỗi: " + response.getStatusCode());
    }

    public String fallbackPaymentGateway(String ticketCode, Double price, Throwable t) {
        System.err.println("Cảnh báo: Cổng thanh toán SePay đang sập hoặc quá tải. Lỗi: " + t.getMessage());
        System.err.println("Kích hoạt Fallback: Chuyển sang thanh toán tiền mặt tại quầy!");
        // Graceful Degradation: Hạ cấp dịch vụ nhẹ nhàng
        return "PAY_AT_COUNTER";
    }

}