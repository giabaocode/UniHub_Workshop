package com.unihub.workshop.controller;

import com.unihub.workshop.controller.dto.AuthResponse;
import com.unihub.workshop.controller.dto.LoginRequest;
import com.unihub.workshop.controller.dto.RegisterRequest;
import com.unihub.workshop.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unihub.workshop.controller.dto.GoogleLoginRequest;
import com.unihub.workshop.controller.dto.GithubLoginRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/create-staff")
    public ResponseEntity<?> createStaff(@RequestBody RegisterRequest request) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!isAdmin) {
            return ResponseEntity.status(403).body("Chỉ Admin mới có quyền tạo nhân sự!");
        }
        return ResponseEntity.ok(authService.createStaff(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuthenticate(@RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.googleAuthenticate(request));
    }

    @PostMapping("/github")
    public ResponseEntity<AuthResponse> githubAuthenticate(@RequestBody GithubLoginRequest request) {
        return ResponseEntity.ok(authService.githubAuthenticate(request));
    }
}
