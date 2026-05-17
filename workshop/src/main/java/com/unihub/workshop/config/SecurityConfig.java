package com.unihub.workshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;
import java.util.List;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exceptions -> exceptions
                    .authenticationEntryPoint((request, response, authException) ->
                        writeSecurityError(response, HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập lại. Phiên đăng nhập không hợp lệ hoặc đã hết hạn."))
                    .accessDeniedHandler((request, response, accessDeniedException) ->
                        writeSecurityError(response, HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này."))
                )
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers("/api/webhooks/**").permitAll()
                    .requestMatchers("/api/auth/**").permitAll()
                    // Public read-only của workshop & seat-stream cho student
                    .requestMatchers(HttpMethod.GET, "/api/workshops", "/api/workshops/**", "/api/workshops/seat-stream").permitAll()
                    // Mutating workshop chỉ ADMIN
                    .requestMatchers(HttpMethod.POST, "/api/workshops/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/workshops/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/workshops/**").hasRole("ADMIN")
                    // Stream notifications của admin: chỉ ADMIN mới được mở
                    .requestMatchers("/api/notifications/stream").hasRole("ADMIN")
                    // Các endpoint admin/staff về vé (batch-checkin, list attendees, manual checkin)
                    .requestMatchers(HttpMethod.PUT, "/api/tickets/batch-checkin").hasAnyRole("ADMIN", "STAFF")
                    .requestMatchers(HttpMethod.PUT, "/api/tickets/*/checkin").hasAnyRole("ADMIN", "STAFF")
                    .requestMatchers(HttpMethod.GET, "/api/tickets/workshop/**").hasAnyRole("ADMIN", "STAFF")
                    // AI admin endpoints
                    .requestMatchers("/api/admin/ai/**").hasRole("ADMIN")
                    // Mặc định các endpoint còn lại trong /api/tickets/** vẫn cần đăng nhập
                    .requestMatchers("/api/tickets/**").authenticated()
                    .requestMatchers("/uploads/**").permitAll()
                    .requestMatchers("/error").permitAll()
                    .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void writeSecurityError(HttpServletResponse response, HttpStatus status, String message) throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(String.format(
                "{\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}",
                status.value(),
                status.getReasonPhrase(),
                message
        ));
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép mọi nguồn (bao gồm cả IP LAN từ điện thoại và domain của Ngrok)
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
