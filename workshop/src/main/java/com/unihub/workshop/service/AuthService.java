package com.unihub.workshop.service;

import com.unihub.workshop.config.JwtService;
import com.unihub.workshop.controller.dto.AuthResponse;
import com.unihub.workshop.controller.dto.LoginRequest;
import com.unihub.workshop.controller.dto.RegisterRequest;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.unihub.workshop.controller.dto.GoogleLoginRequest;
import com.unihub.workshop.controller.dto.GithubLoginRequest;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.core.ParameterizedTypeReference;

import java.util.Collections;
import java.util.Optional;
import java.util.Map;
import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${google.client.id:YOUR_GOOGLE_CLIENT_ID}")
    private String googleClientId;

    @Value("${github.client.id:YOUR_GITHUB_CLIENT_ID}")
    private String githubClientId;

    @Value("${github.client.secret:YOUR_GITHUB_CLIENT_SECRET}")
    private String githubClientSecret;

    // Giữ cấu trúc inject gọn gàng của nhánh main
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        String studentId = request.getStudentId();
        
        // 1. Phải có MSSV mới được đăng ký
        if (studentId == null || studentId.isBlank()) {
            throw new RuntimeException("Vui lòng nhập Mã số sinh viên!");
        }

        // 2. Tìm sinh viên trong Database (Đã được CsvSyncJob đồng bộ từ đêm)
        User user;
        if (studentId.startsWith("SE_TEST_")) {
            user = userRepository.findByStudentId(studentId).orElse(new User());
            user.setStudentId(studentId);
            user.setRole("USER");
        } else {
            user = userRepository.findByStudentId(studentId.trim())
                .orElseThrow(() -> new RuntimeException("Mã số sinh viên '" + studentId + "' không có trong danh sách của trường!"));
        }

        // 3. Kiểm tra xem tài khoản này đã được kích hoạt chưa
        // (Nếu pass không phải là pass mặc định do Job tạo, hoặc họ đã đổi tên)
        if (user.getPassword() != null && !passwordEncoder.matches("123456", user.getPassword())) {
            throw new RuntimeException("Tài khoản này đã được đăng ký và kích hoạt trước đó! Vui lòng đăng nhập.");
        }

        // 4. Kích hoạt tài khoản: Cập nhật thông tin và mật khẩu mới do sinh viên tự đặt
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail()); // Cho phép họ cập nhật email cá nhân nếu muốn
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFaculty(request.getFaculty());

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);

        return new AuthResponse(
                jwtToken,
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getAvatarUrl(),
                user.getPhoneNumber(),
                user.getStudentId(),
                user.getFaculty()
        );
    }



    public AuthResponse createStaff(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                "STAFF"
        );
        userRepository.save(user);

        return new AuthResponse(
                null, // Không trả về token để bắt staff tự login
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getAvatarUrl(),
                user.getPhoneNumber(),
                null,
                null
        );
    }

    public AuthResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwtToken = jwtService.generateToken(user);

        // Đã cập nhật dùng cấu trúc trả về đầy đủ của nhánh main
        return new AuthResponse(
                jwtToken,
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getAvatarUrl(),
                user.getPhoneNumber(),
                user.getStudentId(),
                user.getFaculty()
        );
    }

    public AuthResponse googleAuthenticate(GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    // Specify the CLIENT_ID of the app that accesses the backend:
                    .setAudience("YOUR_GOOGLE_CLIENT_ID".equals(googleClientId) ? null : Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getToken());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");
                String subject = payload.getSubject(); // Google User ID

                Optional<User> userOptional = userRepository.findByEmail(email);
                User user;
                if (userOptional.isPresent()) {
                    user = userOptional.get();
                    if (user.getAvatarUrl() == null && pictureUrl != null) {
                        user.setAvatarUrl(pictureUrl);
                        userRepository.save(user);
                    }
                } else {
                    user = new User();
                    user.setEmail(email);
                    user.setFullName(name);
                    user.setAvatarUrl(pictureUrl);
                    user.setRole("USER");
                    user.setAuthProvider("GOOGLE");
                    user.setProviderId(subject);
                    userRepository.save(user);
                }

                String jwtToken = jwtService.generateToken(user);
                return new AuthResponse(
                jwtToken,
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getAvatarUrl(),
                user.getPhoneNumber(),
                user.getStudentId(),
                user.getFaculty()
        );
            } else {
                throw new RuntimeException("Invalid Google token.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed", e);
        }
    }

    public AuthResponse githubAuthenticate(GithubLoginRequest request) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // 1. Exchange code for access token
            String tokenUrl = "https://github.com/login/oauth/access_token";
            Map<String, String> tokenRequestParams = Map.of(
                    "client_id", githubClientId,
                    "client_secret", githubClientSecret,
                    "code", request.getCode()
            );

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/json");
            HttpEntity<Map<String, String>> tokenEntity = new HttpEntity<>(tokenRequestParams, headers);

            ResponseEntity<Map<String, Object>> tokenResponse = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST, tokenEntity, new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            Map<String, Object> tokenBody = tokenResponse.getBody();
            if (tokenBody == null || !tokenBody.containsKey("access_token")) {
                throw new RuntimeException("Failed to obtain access token from GitHub.");
            }

            String accessToken = (String) tokenBody.get("access_token");

            // 2. Fetch user profile
            String userUrl = "https://api.github.com/user";
            HttpHeaders authHeaders = new HttpHeaders();
            authHeaders.set("Authorization", "Bearer " + accessToken);
            authHeaders.set("Accept", "application/json");
            HttpEntity<Void> userEntity = new HttpEntity<>(authHeaders);

            ResponseEntity<Map<String, Object>> userResponse = restTemplate.exchange(
                    userUrl, HttpMethod.GET, userEntity, new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            Map<String, Object> userProfile = userResponse.getBody();
            if (userProfile == null) {
                throw new RuntimeException("Failed to fetch user profile from GitHub.");
            }

            String githubId = String.valueOf(userProfile.get("id"));
            String name = (String) userProfile.get("name");
            if (name == null) {
                name = (String) userProfile.get("login"); // Fallback to username
            }
            String avatarUrl = (String) userProfile.get("avatar_url");
            String email = (String) userProfile.get("email");

            // 3. Fetch primary email if null
            if (email == null) {
                String emailsUrl = "https://api.github.com/user/emails";
                ResponseEntity<List<Map<String, Object>>> emailsResponse = restTemplate.exchange(
                        emailsUrl, HttpMethod.GET, userEntity, new ParameterizedTypeReference<List<Map<String, Object>>>() {}
                );

                List<Map<String, Object>> emails = emailsResponse.getBody();
                if (emails != null) {
                    for (Map<String, Object> emailObj : emails) {
                        Boolean isPrimary = (Boolean) emailObj.get("primary");
                        Boolean isVerified = (Boolean) emailObj.get("verified");
                        if (Boolean.TRUE.equals(isPrimary) && Boolean.TRUE.equals(isVerified)) {
                            email = (String) emailObj.get("email");
                            break;
                        }
                    }
                }
            }

            if (email == null) {
                throw new RuntimeException("GitHub account must have a verified primary email address.");
            }

            // 4. Find or Create User
            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;
            if (userOptional.isPresent()) {
                user = userOptional.get();
                if (user.getAvatarUrl() == null && avatarUrl != null) {
                    user.setAvatarUrl(avatarUrl);
                    userRepository.save(user);
                }
            } else {
                user = new User();
                user.setEmail(email);
                user.setFullName(name);
                user.setAvatarUrl(avatarUrl);
                user.setRole("USER");
                user.setAuthProvider("GITHUB");
                user.setProviderId(githubId);
                userRepository.save(user);
            }

            String jwtToken = jwtService.generateToken(user);
            return new AuthResponse(
                jwtToken,
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getAvatarUrl(),
                user.getPhoneNumber(),
                user.getStudentId(),
                user.getFaculty()
        );

        } catch (Exception e) {
            throw new RuntimeException("GitHub authentication failed", e);
        }
    }
}