package com.unihub.workshop.service;

import com.unihub.workshop.event.WorkshopSeatChangedEvent;
import com.unihub.workshop.event.WorkshopSeatsRefreshEvent;
import com.unihub.workshop.repository.WorkshopRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class WorkshopSeatEventListener {
    private final WorkshopRepository workshopRepository;
    private final WorkshopSeatSseService workshopSeatSseService;

    public WorkshopSeatEventListener(WorkshopRepository workshopRepository,
                                     WorkshopSeatSseService workshopSeatSseService) {
        this.workshopRepository = workshopRepository;
        this.workshopSeatSseService = workshopSeatSseService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onWorkshopSeatChanged(WorkshopSeatChangedEvent event) {
        workshopRepository.findById(event.getWorkshopId())
                .ifPresent(workshopSeatSseService::sendSeatUpdate);
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onWorkshopSeatsRefresh(WorkshopSeatsRefreshEvent event) {
        workshopSeatSseService.sendRefresh();
    }
}
