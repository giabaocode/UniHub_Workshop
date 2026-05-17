package com.unihub.workshop.service.notification;

import com.unihub.workshop.entity.Notification;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.event.UserNotificationEvent;
import com.unihub.workshop.repository.NotificationRepository;
import com.unihub.workshop.repository.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class InAppNotificationChannel implements NotificationChannel {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationSseService notificationSseService;

    public InAppNotificationChannel(NotificationRepository notificationRepository,
                                    UserRepository userRepository,
                                    NotificationSseService notificationSseService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationSseService = notificationSseService;
    }

    @Override
    public String channelName() {
        return "in-app";
    }

    @Override
    public void send(UserNotificationEvent event) {
        if (event.shouldSendEmail()) {
            return;
        }

        if (event.getUser() == null || event.getUser().getId() == null) {
            return;
        }

        User user = userRepository.findById(event.getUser().getId()).orElse(null);
        if (user == null) {
            return;
        }

        Notification notification = new Notification(user, event.getTitle(), event.getMessage());
        notificationRepository.save(notification);
        notificationSseService.sendUserNotification(user, notification);
    }
}
