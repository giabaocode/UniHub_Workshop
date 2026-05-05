package com.unihub.workshop.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

// @Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final StringRedisTemplate redisTemplate;
    
    // Tối đa 5 request trong vòng 10 giây
    private static final int MAX_REQUESTS = 5;
    private static final int TIME_WINDOW_SECONDS = 10;

    public RateLimitInterceptor(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Lấy IP của Client (Hỗ trợ cả trường hợp dùng Load Balancer/Proxy)
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }
        
        // Tạo khoá Redis dựa trên IP và Endpoint
        String key = "rate_limit:register:" + clientIp;

        Long currentCount = redisTemplate.opsForValue().increment(key);
        
        // Nếu là request đầu tiên trong chu kỳ, set thời gian hết hạn (TTL)
        if (currentCount != null && currentCount == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(TIME_WINDOW_SECONDS));
        }

        // Nếu vượt quá giới hạn
        if (currentCount != null && currentCount > MAX_REQUESTS) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value()); // 429
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\": \"Bạn đang gửi yêu cầu quá nhanh. Vui lòng thử lại sau 10 giây!\"}");
            return false; // Chặn request không cho đi tiếp vào Controller
        }

        return true;
    }
}
