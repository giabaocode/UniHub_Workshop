package com.unihub.workshop.event;

import org.springframework.context.ApplicationEvent;

public class WorkshopSeatChangedEvent extends ApplicationEvent {
    private final Long workshopId;

    public WorkshopSeatChangedEvent(Object source, Long workshopId) {
        super(source);
        this.workshopId = workshopId;
    }

    public Long getWorkshopId() {
        return workshopId;
    }
}
