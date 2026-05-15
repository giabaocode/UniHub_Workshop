package com.unihub.workshop.service;

import com.unihub.workshop.repository.WorkshopRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SeatReleaseJob {

    private final WorkshopRepository workshopRepository;

    public SeatReleaseJob(WorkshopRepository workshopRepository) {
        this.workshopRepository = workshopRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncSeatsOnStartup() {
        syncBookedSeats();
    }

    // Chạy ngầm mỗi 1 phút để tự sửa counter nếu ticket bị sửa/xoá trực tiếp trong DB.
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void syncBookedSeats() {
        int updatedWorkshops = workshopRepository.syncBookedSpotsFromActiveTickets();
        if (updatedWorkshops > 0) {
            System.out.println("Đã đồng bộ lại số ghế đã giữ cho " + updatedWorkshops + " workshop.");
        }
    }
}
