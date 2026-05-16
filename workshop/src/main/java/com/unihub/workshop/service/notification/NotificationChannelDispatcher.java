package com.unihub.workshop.service.notification;

import com.unihub.workshop.event.UserNotificationEvent;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Component
public class NotificationChannelDispatcher {

    private final List<NotificationChannel> channels;

    public NotificationChannelDispatcher(List<NotificationChannel> channels) {
        this.channels = channels;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void dispatch(UserNotificationEvent event) {
        for (NotificationChannel channel : channels) {
            try {
                channel.send(event);
            } catch (RuntimeException error) {
                System.err.println("Lỗi gửi thông báo qua kênh " + channel.channelName() + ": " + error.getMessage());
            }
        }
    }
}
