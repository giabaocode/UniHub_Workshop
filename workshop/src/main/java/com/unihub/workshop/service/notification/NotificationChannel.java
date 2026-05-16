package com.unihub.workshop.service.notification;

import com.unihub.workshop.event.UserNotificationEvent;

public interface NotificationChannel {
    String channelName();

    void send(UserNotificationEvent event);
}
