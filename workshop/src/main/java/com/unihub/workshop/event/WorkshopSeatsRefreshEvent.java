package com.unihub.workshop.event;

import org.springframework.context.ApplicationEvent;

public class WorkshopSeatsRefreshEvent extends ApplicationEvent {
    public WorkshopSeatsRefreshEvent(Object source) {
        super(source);
    }
}
