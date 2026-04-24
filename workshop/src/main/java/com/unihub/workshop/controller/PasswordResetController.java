package com.unihub.workshop.controller;

import com.unihub.workshop.entity.PasswordResetToken;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.repository.PasswordResetTokenRepository;
import com.unihub.workshop.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    public PasswordResetController(UserRepository userRepository, PasswordResetTokenRepository tokenRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/reset-password-request")
    @Transactional
    public ResponseEntity<?> requestPasswordReset() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập"));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete old token if exists
        tokenRepository.deleteByUser(user);

        // Generate new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusHours(1));
        tokenRepository.save(resetToken);

        // Simulate sending email by printing to console
        System.out.println("==================================================");
        System.out.println("MÔ PHỎNG GỬI EMAIL ĐỔI MẬT KHẨU");
        System.out.println("Tới: " + email);
        System.out.println("Token xác nhận: " + token);
        System.out.println("Đường link: http://localhost:5173/reset-password?token=" + token);
        System.out.println("==================================================");

        return ResponseEntity.ok(Map.of("message", "Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư (Console)."));
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu thông tin token hoặc mật khẩu mới"));
        }

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token không hợp lệ"));
        }

        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            return ResponseEntity.badRequest().body(Map.of("message", "Token đã hết hạn"));
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
