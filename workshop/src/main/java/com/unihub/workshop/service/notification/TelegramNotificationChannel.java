package com.unihub.workshop.service.notification;

import com.unihub.workshop.event.UserNotificationEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class TelegramNotificationChannel implements NotificationChannel {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.notifications.telegram.enabled:false}")
    private boolean enabled;

    @Value("${app.notifications.telegram.bot-token:}")
    private String botToken;

    @Value("${app.notifications.telegram.api-base-url:https://api.telegram.org}")
    private String apiBaseUrl;

    @Override
    public String channelName() {
        return "telegram";
    }

    @Override
    public void send(UserNotificationEvent event) {
        String chatId = event.getUser().getTelegramChatId();
        if (!enabled || botToken == null || botToken.isBlank() || chatId == null || chatId.isBlank()) {
            return;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = Map.of(
                "chat_id", chatId,
                "text", event.getTitle() + "\n" + event.getMessage()
        );

        restTemplate.postForEntity(
                apiBaseUrl + "/bot" + botToken + "/sendMessage",
                new HttpEntity<>(body, headers),
                String.class
        );
    }
}
