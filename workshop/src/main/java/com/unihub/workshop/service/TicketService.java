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
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;
import com.unihub.workshop.event.TicketCreatedEvent;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class TicketService {

    private static final List<String> ACTIVE_PAYMENT_STATUSES = List.of("PENDING", "PAID", "PAY_AT_COUNTER");

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentGatewayService paymentGatewayService;

    // 1. CONSTRUCTOR LUÔN NẰM TRÊN CÙNG
    public TicketService(TicketRepository ticketRepository, UserRepository userRepository, WorkshopRepository workshopRepository, ApplicationEventPublisher eventPublisher, PaymentGatewayService paymentGatewayService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
        this.eventPublisher = eventPublisher;
        this.paymentGatewayService = paymentGatewayService;
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
                .map(t -> !"EXPIRED".equals(t.getPaymentStatus()))
                .orElse(false);
    }

    public Map<String, Object> getRegistrationStatus(Long workshopId) {
        User user = getCurrentUser();
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Workshop với ID: " + workshopId));

        Map<String, Object> response = new HashMap<>();
        ticketRepository.findByUserAndWorkshop(user, workshop).ifPresentOrElse(ticket -> {
            response.put("isRegistered", !"EXPIRED".equals(ticket.getPaymentStatus()));
            response.put("paymentStatus", ticket.getPaymentStatus());
            response.put("ticketCode", ticket.getTicketCode());
        }, () -> {
            response.put("isRegistered", false);
            response.put("paymentStatus", null);
        });
        return response;
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
        Workshop workshop = workshopRepository.findByIdForUpdate(workshopId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Workshop với ID: " + workshopId));

        Ticket existingTicket = ticketRepository.findByUserAndWorkshop(user, workshop).orElse(null);
        if (existingTicket != null && !"EXPIRED".equals(existingTicket.getPaymentStatus())) {
            if ("PENDING".equals(existingTicket.getPaymentStatus()) && workshop.getPrice() != null && workshop.getPrice() > 0) {
                String qrUrl = paymentGatewayService.generatePaymentUrl(existingTicket.getTicketCode(), workshop.getPrice());
                Map<String, Object> response = new HashMap<>();
                if (PaymentGatewayService.PAYMENT_GATEWAY_DOWN.equals(qrUrl)) {
                    response.put("status", PaymentGatewayService.PAYMENT_GATEWAY_DOWN);
                    response.put("message", "Cổng thanh toán đang tạm thời gián đoạn. Chỗ của bạn vẫn được giữ, vui lòng thử thanh toán lại trong mục Vé của tôi sau.");
                    response.put("ticketCode", existingTicket.getTicketCode());
                    response.put("amount", workshop.getPrice());
                    return response;
                }

                response.put("status", "REQUIRE_PAYMENT");
                response.put("amount", workshop.getPrice());
                response.put("memo", existingTicket.getTicketCode());
                response.put("ticketCode", existingTicket.getTicketCode());
                response.put("qrUrl", qrUrl);
                return response;
            }
            throw new RuntimeException("Bạn đã sở hữu vé cho sự kiện này!");
        }

        int totalSeats = workshop.getTotalSeats() != null ? workshop.getTotalSeats() : 0;
        long activeTicketCount = ticketRepository.countByWorkshopIdAndPaymentStatusIn(workshop.getId(), ACTIVE_PAYMENT_STATUSES);
        if (activeTicketCount >= totalSeats) {
            throw new RuntimeException("Rất tiếc, sự kiện này đã hết vé!");
        }

        workshop.setBookedSpots((int) activeTicketCount + 1);
        workshopRepository.saveAndFlush(workshop);

        // Tạo mã định danh ngụy trang: TK + 4 số UserID + 4 số WorkshopID + 4 chữ Random
        String randomStr = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String ticketCode = String.format("TK%04d%04d%s", user.getId(), workshop.getId(), randomStr);

        Map<String, Object> response = new HashMap<>();

        // NẾU SINH VIÊN ĐĂNG KÝ LẠI VÉ ĐÃ EXPIRED, TÁI SỬ DỤNG VÉ CŨ THAY VÌ TẠO MỚI (để tránh lỗi Unique Constraint)
        Ticket ticket = existingTicket;
        if (ticket == null) {
            ticket = new Ticket(ticketCode, user, workshop, false);
        } else {
            // Lấy lại mã vé cũ để generate QR
            ticketCode = ticket.getTicketCode();
            ticket.setCreatedAt(LocalDateTime.now()); // Reset lại thời gian đếm ngược 15 phút
            ticket.setScanned(false);
        }

        if (workshop.getPrice() == null || workshop.getPrice() == 0) {
            // Vé MIỄN PHÍ: Trạng thái PAID
            ticket.setPaymentStatus("PAID");
            ticketRepository.saveAndFlush(ticket);
            
            // Phát sự kiện để gửi Email
            eventPublisher.publishEvent(new TicketCreatedEvent(this, ticket));
            
            // Gửi Push Notification cho User
            eventPublisher.publishEvent(new com.unihub.workshop.event.UserNotificationEvent(
                this, user, "Đăng ký thành công", "Bạn đã đăng ký thành công sự kiện: " + workshop.getTitle()
            ));
            
            response.put("status", "FREE_SUCCESS");
            response.put("ticketCode", ticketCode);
        } else {
            // Vé CÓ PHÍ: giữ chỗ trước, sau đó thử tạo QR qua Circuit Breaker.
            ticket.setPaymentStatus("PENDING");
            ticketRepository.saveAndFlush(ticket);

            String qrUrl = paymentGatewayService.generatePaymentUrl(ticketCode, workshop.getPrice());

            if (PaymentGatewayService.PAYMENT_GATEWAY_DOWN.equals(qrUrl)) {
                eventPublisher.publishEvent(new com.unihub.workshop.event.UserNotificationEvent(
                    this, user, "Đã giữ chỗ chờ thanh toán", "Cổng thanh toán đang gián đoạn. Bạn có thể thanh toán lại trong mục Vé của tôi khi cổng hoạt động trở lại."
                ));

                response.put("status", PaymentGatewayService.PAYMENT_GATEWAY_DOWN);
                response.put("message", "Cổng thanh toán đang tạm thời gián đoạn. Bạn đã được giữ chỗ, vui lòng vào Vé của tôi để thanh toán lại khi cổng hoạt động.");
                response.put("ticketCode", ticketCode);
            } else {
                response.put("status", "REQUIRE_PAYMENT");
                response.put("amount", workshop.getPrice());
                response.put("memo", ticketCode); 
                response.put("ticketCode", ticketCode);
                response.put("qrUrl", qrUrl);
            }
        }
        return response;
    }

}
