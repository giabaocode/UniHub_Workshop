package com.unihub.workshop.service.notification;

import com.unihub.workshop.entity.User;
import com.unihub.workshop.event.UserNotificationEvent;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class EmailNotificationChannel implements NotificationChannel {

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@unihub.local}")
    private String fromEmail;

    public EmailNotificationChannel(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public String channelName() {
        return "email";
    }

    @Override
    public void send(UserNotificationEvent event) {
        if (!event.shouldSendEmail()) {
            return;
        }

        User user = event.getUser();
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject(event.getTitle());
            helper.setText(buildHtmlContent(user, event), true);
            mailSender.send(message);
        } catch (Exception error) {
            throw new RuntimeException("Không thể gửi email tới " + user.getEmail() + ": " + error.getMessage(), error);
        }
    }

    private String buildHtmlContent(User user, UserNotificationEvent event) {
        String userName = user.getFullName() != null && !user.getFullName().isBlank()
                ? escapeHtml(user.getFullName())
                : "bạn";

        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                  <div style="background-color: #f59e0b; color: #111827; padding: 20px; text-align: center;">
                    <h2 style="margin: 0; font-size: 20px;">%s</h2>
                  </div>
                  <div style="padding: 28px; background-color: #ffffff;">
                    <p style="font-size: 16px; color: #374151; margin-top: 0;">Chào <strong>%s</strong>,</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">%s</p>
                    <div style="margin-top: 20px; padding: 14px 16px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; color: #92400e; font-size: 14px;">
                      Đây là email tự động từ UniHub Workshop. Vui lòng kiểm tra mục thông báo trong ứng dụng để theo dõi cập nhật mới nhất.
                    </div>
                  </div>
                  <div style="background-color: #111827; color: #f9fafb; text-align: center; padding: 14px; font-size: 13px;">
                    UniHub Workshop
                  </div>
                </div>
                """.formatted(
                escapeHtml(event.getTitle()),
                userName,
                escapeHtml(event.getMessage())
        );
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
