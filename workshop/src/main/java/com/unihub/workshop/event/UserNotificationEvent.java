package com.unihub.workshop.event;

import com.unihub.workshop.entity.User;
import org.springframework.context.ApplicationEvent;

public class UserNotificationEvent extends ApplicationEvent {
    private final User user;
    private final String title;
    private final String message;

    public UserNotificationEvent(Object source, User user, String title, String message) {
        super(source);
        this.user = user;
        this.title = title;
        this.message = message;
    }

    public User getUser() { return user; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
}
