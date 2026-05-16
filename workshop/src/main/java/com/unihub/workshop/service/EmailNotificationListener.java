package com.unihub.workshop.service;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.event.TicketCreatedEvent;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class EmailNotificationListener {

    private final JavaMailSender mailSender;

    public EmailNotificationListener(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Observer Pattern: Lắng nghe sự kiện TicketCreatedEvent
    // Dùng @Async + AFTER_COMMIT để không block luồng xử lý chính và chỉ gửi khi transaction thành công.
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleTicketCreatedEvent(TicketCreatedEvent event) {
        Ticket ticket = event.getTicket();
        String toEmail = ticket.getUser().getEmail();
        
        if (toEmail == null || toEmail.isEmpty()) return;

        System.out.println("Chuẩn bị gửi email xác nhận cho: " + toEmail);
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("leekunda13@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đăng ký Workshop thành công - UniHub");
            
            String userName = ticket.getUser().getFullName() != null ? ticket.getUser().getFullName() : "Bạn";
            String workshopTitle = ticket.getWorkshop().getTitle();
            String ticketCode = ticket.getTicketCode();
            String paymentStatus = ticket.getPaymentStatus();
            
            // Format HTML Email
            String htmlContent = String.format(
                "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;\">" +
                "    <div style=\"background-color: #2563eb; color: white; padding: 20px; text-align: center;\">" +
                "        <h2 style=\"margin: 0;\">Xác Nhận Đăng Ký Vé Sự Kiện</h2>" +
                "    </div>" +
                "    <div style=\"padding: 30px; background-color: #f8fafc;\">" +
                "        <p style=\"font-size: 16px; color: #334155;\">Chào <strong>%s</strong>,</p>" +
                "        <p style=\"font-size: 16px; color: #334155;\">Cảm ơn bạn đã đăng ký tham gia sự kiện <strong>%s</strong>. Dưới đây là thông tin vé của bạn:</p>" +
                "        " +
                "        <div style=\"background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 5px solid #2563eb; box-shadow: 0 2px 5px rgba(0,0,0,0.05);\">" +
                "            <p style=\"margin: 5px 0; color: #475569;\"><strong>Mã Vé:</strong> <span style=\"font-size: 18px; color: #2563eb; font-weight: bold;\">%s</span></p>" +
                "            <p style=\"margin: 5px 0; color: #475569;\"><strong>Trạng Thái Thanh Toán:</strong> <span style=\"color: #10b981; font-weight: bold;\">%s</span></p>" +
                "        </div>" +
                "        " +
                "        <div style=\"text-align: center; margin-top: 30px;\">" +
                "            <p style=\"font-size: 14px; color: #64748b; margin-bottom: 10px;\">Vui lòng xuất trình mã QR này để check-in tại sự kiện</p>" +
                "            <img src=\"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=%s\" alt=\"QR Code\" style=\"border: 2px solid #e2e8f0; border-radius: 10px; padding: 10px; background: white;\" />" +
                "        </div>" +
                "    </div>" +
                "    <div style=\"background-color: #1e293b; color: white; text-align: center; padding: 15px; font-size: 14px;\">" +
                "        <p style=\"margin: 0;\">© 2026 UniHub. Mọi thắc mắc vui lòng liên hệ ban tổ chức.</p>" +
                "    </div>" +
                "</div>",
                userName, workshopTitle, ticketCode, paymentStatus, ticketCode
            );
            
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("Đã gửi email xác nhận thành công (kèm QR Code) tới: " + toEmail);
        } catch (Exception e) {
            System.err.println("Lỗi gửi email HTML: " + e.getMessage());
        }
    }
}
