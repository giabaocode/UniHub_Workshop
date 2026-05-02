package com.unihub.workshop.service;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.event.TicketCreatedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class EmailNotificationListener {

    private final JavaMailSender mailSender;

    public EmailNotificationListener(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Observer Pattern: Lắng nghe sự kiện TicketCreatedEvent
    // Dùng @Async để không block luồng xử lý chính
    @Async
    @EventListener
    public void handleTicketCreatedEvent(TicketCreatedEvent event) {
        Ticket ticket = event.getTicket();
        String toEmail = ticket.getUser().getEmail();
        
        if (toEmail == null || toEmail.isEmpty()) return;

        System.out.println("Chuẩn bị gửi email xác nhận cho: " + toEmail);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("leekunda13@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Xác nhận đăng ký Workshop thành công - UniHub");
        
        String text = String.format("Chào %s,\n\nBạn đã đăng ký thành công Workshop: %s.\n" +
                "Mã vé của bạn là: %s\n" +
                "Trạng thái thanh toán: %s\n\n" +
                "Vui lòng sử dụng mã vé này (hoặc mã QR trên hệ thống) để check-in tại sự kiện.\n\nTrân trọng,\nBan tổ chức UniHub.",
                ticket.getUser().getFullName() != null ? ticket.getUser().getFullName() : "Bạn",
                ticket.getWorkshop().getTitle(),
                ticket.getTicketCode(),
                ticket.getPaymentStatus());
                
        message.setText(text);
        
        try {
            mailSender.send(message);
            System.out.println("Đã gửi email xác nhận thành công tới: " + toEmail);
        } catch (Exception e) {
            System.err.println("Lỗi gửi email: " + e.getMessage());
        }
    }
}
