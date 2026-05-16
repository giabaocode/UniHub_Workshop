package com.unihub.workshop.service;

import com.unihub.workshop.event.WorkshopSeatsRefreshEvent;
import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.WorkshopRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SeatReleaseJob {

    private final TicketRepository ticketRepository;
    private final WorkshopRepository workshopRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.pending-ticket.timeout-minutes:15}")
    private long pendingTicketTimeoutMinutes;

    public SeatReleaseJob(TicketRepository ticketRepository,
                          WorkshopRepository workshopRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.ticketRepository = ticketRepository;
        this.workshopRepository = workshopRepository;
        this.eventPublisher = eventPublisher;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncSeatsOnStartup() {
        syncBookedSeats();
    }

    // Chạy nền thưa hơn để không tranh lock workshop trong các đợt mở đăng ký cao điểm.
    @Scheduled(
            initialDelayString = "${app.seat-sync.initial-delay-ms:600000}",
            fixedDelayString = "${app.seat-sync.fixed-delay-ms:600000}"
    )
    @Transactional
    public void syncBookedSeats() {
        int expiredTickets = expireOverduePendingTickets();
        int updatedWorkshops = workshopRepository.syncBookedSpotsFromActiveTickets();

        if (expiredTickets > 0 || updatedWorkshops > 0) {
            if (expiredTickets > 0) {
                System.out.println("Đã chuyển " + expiredTickets + " vé PENDING quá hạn sang EXPIRED.");
            }
            if (updatedWorkshops > 0) {
                System.out.println("Đã đồng bộ lại số ghế đã giữ cho " + updatedWorkshops + " workshop.");
            }
            eventPublisher.publishEvent(new WorkshopSeatsRefreshEvent(this));
        }
    }

    private int expireOverduePendingTickets() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(pendingTicketTimeoutMinutes);
        List<Ticket> overdueTickets = ticketRepository.findByPaymentStatusAndCreatedAtBefore("PENDING", cutoff);

        if (overdueTickets.isEmpty()) {
            return 0;
        }

        overdueTickets.forEach(ticket -> ticket.setPaymentStatus("EXPIRED"));
        ticketRepository.saveAll(overdueTickets);
        ticketRepository.flush();
        return overdueTickets.size();
    }
}
