package com.unihub.workshop.service;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.UserRepository;
import com.unihub.workshop.repository.WorkshopRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;
import com.unihub.workshop.event.TicketCreatedEvent;
import com.unihub.workshop.event.WorkshopSeatChangedEvent;
import com.unihub.workshop.service.notification.UserNotificationService;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentGatewayService paymentGatewayService;
    private final UserNotificationService userNotificationService;
    private final ConcurrentHashMap<String, RegistrationCacheEntry> registrationCache = new ConcurrentHashMap<>();

    @Value("${app.registration-cache.enabled:true}")
    private boolean registrationCacheEnabled;

    @Value("${app.registration-cache.ttl-ms:900000}")
    private long registrationCacheTtlMs;

    @Value("${app.registration-cache.max-size:50000}")
    private int registrationCacheMaxSize;

    // 1. CONSTRUCTOR LUÔN NẰM TRÊN CÙNG
    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         WorkshopRepository workshopRepository,
                         ApplicationEventPublisher eventPublisher,
                         PaymentGatewayService paymentGatewayService,
                         UserNotificationService userNotificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
        this.eventPublisher = eventPublisher;
        this.paymentGatewayService = paymentGatewayService;
        this.userNotificationService = userNotificationService;
    }

    // 2. HÀM DÙNG CHUNG (PRIVATE)
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user;
        }
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
        String registrationCacheKey = buildRegistrationCacheKey(user.getId(), workshopId);
        Map<String, Object> cachedResponse = getCachedRegistrationResponse(registrationCacheKey);
        if (cachedResponse != null) {
            return cachedResponse;
        }

        Ticket existingTicket = ticketRepository.findByUserIdAndWorkshopId(user.getId(), workshopId).orElse(null);
        if (existingTicket != null && !"EXPIRED".equals(existingTicket.getPaymentStatus())) {
            Workshop existingWorkshop = existingTicket.getWorkshop();
            if ("PENDING".equals(existingTicket.getPaymentStatus()) && requiresPayment(existingWorkshop)) {
                Map<String, Object> response = buildPaymentResponse(existingTicket.getTicketCode(), existingWorkshop);
                cachePaymentRegistration(registrationCacheKey, response);
                return response;
            } 
            cacheDuplicateRegistration(registrationCacheKey);
            throw new RuntimeException("Bạn đã sở hữu vé cho sự kiện này!");
        }

        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Workshop với ID: " + workshopId));

        if ("CANCELLED".equalsIgnoreCase(workshop.getStatus())) {
            throw new RuntimeException("Sự kiện này đã bị ban tổ chức hủy.");
        }

        if (workshop.getTotalSeats() == null || workshop.getTotalSeats() <= 0) {
            throw new RuntimeException("Rất tiếc, sự kiện này đã hết vé!");
        }

        int reservedRows = workshopRepository.incrementSeatIfAvailable(workshop.getId());
        if (reservedRows == 0) {
            throw new RuntimeException("Rất tiếc, sự kiện này đã hết vé!");
        }

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

        try {
            if (!requiresPayment(workshop)) {
                // Vé MIỄN PHÍ: Trạng thái PAID
                ticket.setPaymentStatus("PAID");
                ticketRepository.saveAndFlush(ticket);

                // Phát sự kiện để gửi Email
                eventPublisher.publishEvent(new TicketCreatedEvent(this, ticket));
                eventPublisher.publishEvent(new WorkshopSeatChangedEvent(this, workshop.getId()));

                userNotificationService.notifyUser(
                    user,
                    "Đăng ký thành công",
                    "Bạn đã đăng ký thành công sự kiện: " + workshop.getTitle()
                );

                response.put("status", "FREE_SUCCESS");
                response.put("ticketCode", ticketCode);
                cacheDuplicateRegistration(registrationCacheKey);
            } else {
                // Vé CÓ PHÍ: giữ chỗ trước, QR được tạo local để không block request bởi cổng thanh toán ngoài.
                ticket.setPaymentStatus("PENDING");
                ticketRepository.saveAndFlush(ticket);
                eventPublisher.publishEvent(new WorkshopSeatChangedEvent(this, workshop.getId()));
                userNotificationService.notifyUser(
                    user,
                    "Giữ chỗ thành công",
                    "Bạn đã giữ chỗ cho sự kiện: " + workshop.getTitle() + ". Vui lòng hoàn tất thanh toán để xác nhận vé."
                );
                response.putAll(buildPaymentResponse(ticketCode, workshop));
                cachePaymentRegistration(registrationCacheKey, response);
            }
            return response;
        } catch (DataIntegrityViolationException e) {
            cacheDuplicateRegistration(registrationCacheKey);
            throw new RuntimeException("Bạn đã sở hữu vé cho sự kiện này!");
        }
    }

    private boolean requiresPayment(Workshop workshop) {
        return workshop.getPrice() != null && workshop.getPrice() > 0;
    }

    private Map<String, Object> buildPaymentResponse(String ticketCode, Workshop workshop) {
        String qrUrl = paymentGatewayService.generatePaymentUrl(ticketCode, workshop.getPrice());
        Map<String, Object> response = new HashMap<>();
        if (PaymentGatewayService.PAYMENT_GATEWAY_DOWN.equals(qrUrl)) {
            response.put("status", PaymentGatewayService.PAYMENT_GATEWAY_DOWN);
            response.put("message", "Cổng thanh toán đang tạm thời gián đoạn. Chỗ của bạn vẫn được giữ, vui lòng thử thanh toán lại trong mục Vé của tôi sau.");
            response.put("ticketCode", ticketCode);
            response.put("amount", workshop.getPrice());
            return response;
        }

        response.put("status", "REQUIRE_PAYMENT");
        response.put("amount", workshop.getPrice());
        response.put("memo", ticketCode);
        response.put("ticketCode", ticketCode);
        response.put("qrUrl", qrUrl);
        return response;
    }

    private String buildRegistrationCacheKey(Long userId, Long workshopId) {
        return userId + ":" + workshopId;
    }

    private Map<String, Object> getCachedRegistrationResponse(String key) {
        if (!registrationCacheEnabled) {
            return null;
        }

        RegistrationCacheEntry cached = registrationCache.get(key);
        if (cached == null) {
            return null;
        }

        if (cached.expiresAtMillis() <= System.currentTimeMillis()) {
            registrationCache.remove(key);
            return null;
        }

        if (cached.paymentResponse() != null) {
            return new HashMap<>(cached.paymentResponse());
        }

        throw new RuntimeException("Bạn đã sở hữu vé cho sự kiện này!");
    }

    private void cacheDuplicateRegistration(String key) {
        cacheRegistration(key, null);
    }

    private void cachePaymentRegistration(String key, Map<String, Object> response) {
        cacheRegistration(key, response);
    }

    private void cacheRegistration(String key, Map<String, Object> paymentResponse) {
        if (!registrationCacheEnabled) {
            return;
        }

        if (registrationCache.size() >= registrationCacheMaxSize) {
            registrationCache.clear();
        }

        Map<String, Object> responseCopy = paymentResponse != null ? new HashMap<>(paymentResponse) : null;
        registrationCache.put(key, new RegistrationCacheEntry(responseCopy, System.currentTimeMillis() + registrationCacheTtlMs));
    }

    private record RegistrationCacheEntry(Map<String, Object> paymentResponse, long expiresAtMillis) {
    }

}
