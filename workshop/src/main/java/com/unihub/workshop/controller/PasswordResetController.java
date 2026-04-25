package com.unihub.workshop.controller;

import com.unihub.workshop.entity.PasswordResetToken;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.repository.PasswordResetTokenRepository;
import com.unihub.workshop.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@unihub.vn}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public PasswordResetController(UserRepository userRepository,
                                   PasswordResetTokenRepository tokenRepository,
                                   PasswordEncoder passwordEncoder,
                                   JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng cung cấp địa chỉ email"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "Nếu email tồn tại, link đặt lại mật khẩu sẽ được gửi tới hộp thư của bạn."));
        }

        User user = userOpt.get();
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusHours(1));
        tokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        try {
            sendHtmlResetEmail(email, user.getFullName(), resetLink);
        } catch (Exception e) {
            System.err.println("Failed to send reset email: " + e.getMessage());
            System.out.println("=== RESET LINK (email failed) ===");
            System.out.println(resetLink);
            System.out.println("=================================");
        }

        return ResponseEntity.ok(Map.of("message", "Nếu email tồn tại, link đặt lại mật khẩu sẽ được gửi tới hộp thư của bạn."));
    }

    private void sendHtmlResetEmail(String toEmail, String fullName, String resetLink) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        try {
            helper.setFrom(fromEmail, "UniHub Workshop");
        } catch (java.io.UnsupportedEncodingException e) {
            helper.setFrom(fromEmail);
        }
        helper.setTo(toEmail);
        helper.setSubject("🔐 Đặt lại mật khẩu UniHub của bạn");

        String firstName = fullName != null && !fullName.isBlank() ? fullName.split(" ")[fullName.split(" ").length - 1] : "bạn";

        String htmlContent = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Đặt lại mật khẩu</title>
            </head>
            <body style="margin:0; padding:0; background-color:#f4f7ff; font-family: 'Segoe UI', Arial, sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f7ff; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%%;">
            
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%%, #7c3aed 100%%); border-radius: 20px 20px 0 0; padding: 40px; text-align: center;">
                          <div style="display:inline-block; background: rgba(255,255,255,0.15); border-radius: 16px; padding: 16px 24px; margin-bottom: 16px;">
                            <span style="font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">UniHub</span>
                          </div>
                          <p style="margin:0; color: rgba(255,255,255,0.85); font-size: 15px; margin-top: 8px;">Workshop Management Platform</p>
                        </td>
                      </tr>
            
                      <!-- Body -->
                      <tr>
                        <td style="background:#ffffff; padding: 48px 40px;">
            
                          <!-- Icon -->
                          <div style="text-align: center; margin-bottom: 28px;">
                            <div style="display: inline-block; background: #eff6ff; border-radius: 50%%; padding: 20px;">
                              <img src="https://img.icons8.com/ios-filled/50/2563eb/lock-2.png" width="40" height="40" alt="Lock" style="display: block;">
                            </div>
                          </div>
            
                          <h1 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 800; color: #111827; text-align: center;">
                            Đặt lại mật khẩu
                          </h1>
                          <p style="margin: 0 0 32px 0; font-size: 16px; color: #6b7280; text-align: center; line-height: 1.6;">
                            Xin chào <strong style="color: #374151;">%s</strong>, chúng tôi nhận được yêu cầu<br>đặt lại mật khẩu cho tài khoản của bạn.
                          </p>
            
                          <!-- CTA Button -->
                          <div style="text-align: center; margin: 0 0 36px 0;">
                            <a href="%s"
                               style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%%, #7c3aed 100%%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 16px 40px; border-radius: 12px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                              🔑 Đặt lại mật khẩu ngay
                            </a>
                          </div>
            
                          <!-- Divider -->
                          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
                          <!-- Info box -->
                          <div style="background: #f9fafb; border-left: 4px solid #2563eb; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.7;">
                              ⏱️ <strong>Link có hiệu lực trong 1 giờ</strong> kể từ khi email này được gửi.<br>
                              🛡️ Nếu bạn <strong>không yêu cầu</strong> đặt lại mật khẩu, hãy bỏ qua email này — tài khoản của bạn vẫn an toàn.
                            </p>
                          </div>
            
                          <!-- Fallback link -->
                          <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
                            Nút không hoạt động? Sao chép đường dẫn bên dưới vào trình duyệt:<br>
                            <a href="%s" style="color: #2563eb; word-break: break-all;">%s</a>
                          </p>
            
                        </td>
                      </tr>
            
                      <!-- Footer -->
                      <tr>
                        <td style="background: #f9fafb; border-radius: 0 0 20px 20px; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                            Email này được gửi từ hệ thống <strong>UniHub Workshop</strong>
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                            © 2025 UniHub. Đây là email tự động, vui lòng không trả lời.
                          </p>
                        </td>
                      </tr>
            
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
        """.formatted(firstName, resetLink, resetLink, resetLink);

        helper.setText(htmlContent, true);
        mailSender.send(mimeMessage);
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu thông tin token hoặc mật khẩu mới"));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu phải có ít nhất 6 ký tự"));
        }

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Link không hợp lệ hoặc đã được sử dụng"));
        }

        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            return ResponseEntity.badRequest().body(Map.of("message", "Link đã hết hạn. Vui lòng yêu cầu lại."));
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công! Vui lòng đăng nhập."));
    }
}
