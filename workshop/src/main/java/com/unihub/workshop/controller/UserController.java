package com.unihub.workshop.controller;

import com.unihub.workshop.controller.dto.UserProfileDto;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        User user = userRepository.findByEmail(currentPrincipalName)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new UserProfileDto(
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAvatarUrl(),
                user.getStudentId(),
                user.getFaculty()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(@RequestBody UserProfileDto profileDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        User user = userRepository.findByEmail(currentPrincipalName)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Email cannot be changed, so we ignore profileDto.getEmail()
        user.setFullName(profileDto.getFullName());
        user.setPhoneNumber(profileDto.getPhoneNumber());
        user.setAvatarUrl(profileDto.getAvatarUrl());
        user.setStudentId(profileDto.getStudentId());
        user.setFaculty(profileDto.getFaculty());

        userRepository.save(user);

        return ResponseEntity.ok(new UserProfileDto(
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAvatarUrl(),
                user.getStudentId(),
                user.getFaculty()
        ));
    }

    @GetMapping("/staff")
    public ResponseEntity<?> getStaffList() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(403).body("Chỉ Admin mới có quyền xem danh sách nhân sự!");
        }

        java.util.List<User> staffList = userRepository.findAll().stream()
                .filter(u -> "STAFF".equals(u.getRole()))
                .collect(java.util.stream.Collectors.toList());

        java.util.List<java.util.Map<String, Object>> result = staffList.stream().map(s -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getFullName());
            map.put("email", s.getEmail());
            map.put("status", "Hoạt động");
            return map;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody com.unihub.workshop.controller.dto.RegisterRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Chỉ Admin mới có quyền cập nhật nhân sự!");
        }

        User staff = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân sự"));
        if (!"STAFF".equals(staff.getRole())) throw new RuntimeException("User không phải là nhân sự");

        staff.setFullName(request.getFullName());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            staff.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        userRepository.save(staff);
        return ResponseEntity.ok(java.util.Map.of("message", "Cập nhật thành công"));
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Chỉ Admin mới có quyền xóa nhân sự!");
        }

        User staff = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân sự"));
        if (!"STAFF".equals(staff.getRole())) throw new RuntimeException("User không phải là nhân sự");

        userRepository.delete(staff);
        return ResponseEntity.ok(java.util.Map.of("message", "Xóa thành công"));
    }
}
