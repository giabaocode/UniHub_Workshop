package com.unihub.workshop.event;

import com.unihub.workshop.entity.User;
import org.springframework.context.ApplicationEvent;

public class UserNotificationEvent extends ApplicationEvent {
    private final User user;
    private final String title;
    private final String message;
    private final boolean sendEmail;

    public UserNotificationEvent(Object source, User user, String title, String message) {
        this(source, user, title, message, false);
    }

    public UserNotificationEvent(Object source, User user, String title, String message, boolean sendEmail) {
        super(source);
        this.user = user;
        this.title = title;
        this.message = message;
        this.sendEmail = sendEmail;
    }

    public User getUser() { return user; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public boolean shouldSendEmail() { return sendEmail; }
}
