package com.unihub.workshop.service;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.repository.TicketRepository;
import com.unihub.workshop.repository.WorkshopRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SeatReleaseJob {

    private final TicketRepository ticketRepository;
    private final WorkshopRepository workshopRepository;

    public SeatReleaseJob(TicketRepository ticketRepository, WorkshopRepository workshopRepository) {
        this.ticketRepository = ticketRepository;
        this.workshopRepository = workshopRepository;
    }

    // Chạy ngầm mỗi 1 phút (60,000 ms)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void releaseExpiredSeats() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(15);
        List<Ticket> expiredTickets = ticketRepository.findByPaymentStatusAndCreatedAtBefore("PENDING", expirationTime);

        if (!expiredTickets.isEmpty()) {
            System.out.println("Đang thu hồi " + expiredTickets.size() + " vé hết hạn giữ chỗ...");
        }

        for (Ticket ticket : expiredTickets) {
            // Chuyển trạng thái vé thành EXPIRED
            ticket.setPaymentStatus("EXPIRED");
            ticketRepository.save(ticket);

            // Nhả ghế lại cho Workshop
            workshopRepository.decrementSeat(ticket.getWorkshop().getId());
            
            System.out.println("Đã nhả ghế cho sự kiện " + ticket.getWorkshop().getId() + " từ vé " + ticket.getTicketCode());
        }
    }
}
