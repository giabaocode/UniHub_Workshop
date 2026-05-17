package com.unihub.workshop.service;

import com.unihub.workshop.entity.RefundLog;
import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.event.UserNotificationEvent;
import com.unihub.workshop.event.WorkshopSeatChangedEvent;
import com.unihub.workshop.repository.PaymentTransactionRepository;
import com.unihub.workshop.repository.RefundLogRepository;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.WorkshopRepository;
import com.unihub.workshop.service.notification.UserNotificationService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final TicketRepository ticketRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final RefundLogRepository refundLogRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final UserNotificationService userNotificationService;

    public WorkshopService(WorkshopRepository workshopRepository,
                           TicketRepository ticketRepository,
                           PaymentTransactionRepository paymentTransactionRepository,
                           RefundLogRepository refundLogRepository,
                           ApplicationEventPublisher eventPublisher,
                           UserNotificationService userNotificationService) {
        this.workshopRepository = workshopRepository;
        this.ticketRepository = ticketRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.refundLogRepository = refundLogRepository;
        this.eventPublisher = eventPublisher;
        this.userNotificationService = userNotificationService;
    }

    public List<Workshop> getAllWorkshops() {
        return workshopRepository.findAll();
    }

    public Optional<Workshop> getWorkshopById(Long id) {
        return workshopRepository.findById(id);
    }

    public Workshop createWorkshop(Workshop workshop) {
        if (workshop.getStatus() == null) {
            workshop.setStatus(Workshop.STATUS_ACTIVE);
        }
        return workshopRepository.save(workshop);
    }

    public Workshop updateWorkshop(Long id, Workshop workshopDetails) {
        Workshop workshop = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workshop not found with id: " + id));

        if (Workshop.STATUS_CANCELLED.equalsIgnoreCase(workshop.getStatus())) {
            throw new RuntimeException("Workshop đã bị hủy, không thể chỉnh sửa.");
        }

        workshop.setTitle(workshopDetails.getTitle());
        workshop.setDescription(workshopDetails.getDescription());
        workshop.setSpeaker(workshopDetails.getSpeaker());
        workshop.setRoom(workshopDetails.getRoom());
        workshop.setEventDate(workshopDetails.getEventDate());
        workshop.setStartTime(workshopDetails.getStartTime());
        workshop.setRegistrationDeadline(workshopDetails.getRegistrationDeadline());
        workshop.setTotalSeats(workshopDetails.getTotalSeats());
        workshop.setPrice(workshopDetails.getPrice());
        workshop.setCoverImageUrl(workshopDetails.getCoverImageUrl());
        workshop.setPdfUrl(workshopDetails.getPdfUrl());
        workshop.setRoomMapUrl(workshopDetails.getRoomMapUrl());
        workshop.setAiSummary(workshopDetails.getAiSummary());

        return workshopRepository.save(workshop);
    }

    @Transactional
    public void deleteWorkshop(Long id) {
        Workshop workshop = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workshop not found with id: " + id));

        boolean isCancelled = Workshop.STATUS_CANCELLED.equalsIgnoreCase(workshop.getStatus());
        if (!isCancelled && !hasWorkshopDatePassed(workshop)) {
            throw new RuntimeException("Chỉ được xóa workshop đã tổ chức xong. Với workshop chưa tổ chức, vui lòng dùng chức năng \"Hủy workshop\" để chuyển sang CANCELLED và gửi thông báo cho sinh viên.");
        }

        List<Ticket> tickets = ticketRepository.findByWorkshopId(id);
        List<Long> ticketIds = tickets.stream()
                .map(Ticket::getId)
                .toList();
        if (!ticketIds.isEmpty()) {
            paymentTransactionRepository.deleteByTicketIdIn(ticketIds);
            ticketRepository.deleteAll(tickets);
        }

        workshopRepository.delete(workshop);
    }

    /**
     * Hủy workshop (soft cancel):
     *  - Đánh dấu status = CANCELLED, ghi reason + cancelledAt.
     *  - Đánh dấu mọi vé hợp lệ thành CANCELLED.
     *  - Bắn UserNotificationEvent cho từng SV (in-app + email + telegram).
     *  - Vé đã PAID -> ghi RefundLog để bộ phận tài chính xử lý hoàn tiền thủ công.
     *  - Phát SSE để FE student/admin tự refresh danh sách.
     */
    @Transactional
    public Workshop cancelWorkshop(Long id, String reason) {
        Workshop workshop = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy workshop với id: " + id));

        if (Workshop.STATUS_CANCELLED.equalsIgnoreCase(workshop.getStatus())) {
            throw new RuntimeException("Workshop đã được hủy trước đó.");
        }

        String safeReason = reason == null || reason.isBlank()
                ? "Ban tổ chức đã hủy sự kiện."
                : reason.trim();

        workshop.setStatus(Workshop.STATUS_CANCELLED);
        workshop.setCancelledAt(LocalDateTime.now());
        workshop.setCancellationReason(safeReason);
        workshopRepository.save(workshop);

        List<Ticket> affectedTickets = ticketRepository.findByWorkshopIdAndPaymentStatusIn(
                id, List.of("PENDING", "PAID", "PAY_AT_COUNTER"));

        for (Ticket ticket : affectedTickets) {
            String previousStatus = ticket.getPaymentStatus();
            ticket.setPaymentStatus("CANCELLED");
            ticketRepository.save(ticket);

            // Vé đã trả tiền -> log refund để xử lý hoàn tiền
            if ("PAID".equals(previousStatus)) {
                Double amount = workshop.getPrice() != null ? workshop.getPrice() : 0.0;
                refundLogRepository.save(new RefundLog(
                        ticket.getTicketCode(),
                        amount,
                        "Workshop bị hủy. Lý do: " + safeReason
                ));
            }

            if (ticket.getUser() != null) {
                String title = "Xác nhận hủy workshop \"" + workshop.getTitle() + "\"";
                String message = buildCancellationMessage(workshop, previousStatus, safeReason);
                userNotificationService.notifyUser(ticket.getUser(), title, message);
                eventPublisher.publishEvent(new UserNotificationEvent(
                        this,
                        ticket.getUser(),
                        title,
                        message,
                        true
                ));
            }
        }

        // Reset bookedSpots về 0 và phát SSE seat update
        workshop.setBookedSpots(0);
        workshopRepository.save(workshop);
        eventPublisher.publishEvent(new WorkshopSeatChangedEvent(this, workshop.getId()));

        return workshop;
    }

    private String buildCancellationMessage(Workshop workshop, String previousStatus, String reason) {
        StringBuilder sb = new StringBuilder();
        sb.append("Ban tổ chức xác nhận sự kiện \"").append(workshop.getTitle()).append("\" đã bị hủy. ");
        sb.append("Lý do: ").append(reason).append(". ");
        if ("PAID".equals(previousStatus)) {
            sb.append("Vé của bạn đã được ghi nhận để hoàn tiền, ban tổ chức sẽ liên hệ trong thời gian sớm nhất.");
        } else {
            sb.append("Bạn không cần thực hiện thêm thao tác nào.");
        }
        return sb.toString();
    }

    private boolean hasWorkshopDatePassed(Workshop workshop) {
        return workshop.getEventDate() != null && workshop.getEventDate().isBefore(LocalDateTime.now().toLocalDate());
    }
}
