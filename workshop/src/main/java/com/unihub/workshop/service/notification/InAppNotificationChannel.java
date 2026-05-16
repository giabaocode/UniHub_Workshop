package com.unihub.workshop.service.notification;

import com.unihub.workshop.entity.Notification;
import com.unihub.workshop.event.UserNotificationEvent;
import com.unihub.workshop.repository.NotificationRepository;
import org.springframework.stereotype.Component;

@Component
public class InAppNotificationChannel implements NotificationChannel {

    private final NotificationRepository notificationRepository;
    private final NotificationSseService notificationSseService;

    public InAppNotificationChannel(NotificationRepository notificationRepository,
                                    NotificationSseService notificationSseService) {
        this.notificationRepository = notificationRepository;
        this.notificationSseService = notificationSseService;
    }

    @Override
    public String channelName() {
        return "in-app";
    }

    @Override
    public void send(UserNotificationEvent event) {
        Notification notification = new Notification(event.getUser(), event.getTitle(), event.getMessage());
        notificationRepository.save(notification);
        notificationSseService.sendUserNotification(event.getUser(), notification);
    }
}
