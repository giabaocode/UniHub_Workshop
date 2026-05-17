package com.unihub.workshop.service.notification;

import com.unihub.workshop.entity.Notification;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.repository.NotificationRepository;
import com.unihub.workshop.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationSseService notificationSseService;

    public UserNotificationService(NotificationRepository notificationRepository,
                                   UserRepository userRepository,
                                   NotificationSseService notificationSseService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationSseService = notificationSseService;
    }

    public Notification notifyUser(User user, String title, String message) {
        if (user == null || user.getId() == null) {
            return null;
        }

        User managedUser = userRepository.findById(user.getId()).orElse(null);
        if (managedUser == null) {
            return null;
        }

        Notification notification = notificationRepository.save(new Notification(managedUser, title, message));
        notificationSseService.sendUserNotification(managedUser, notification);
        return notification;
    }
}
