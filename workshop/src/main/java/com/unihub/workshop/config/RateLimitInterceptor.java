package com.unihub.workshop.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.beans.factory.annotation.Value;

import java.time.Duration;

// @Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final StringRedisTemplate redisTemplate;

    @Value("${app.rate-limit.enabled:true}")
    private boolean isEnabled;
    
    // Tối đa 5 request trong vòng 10 giây
    private static final int MAX_REQUESTS = 5;
    private static final int TIME_WINDOW_SECONDS = 10;

    public RateLimitInterceptor(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!isEnabled) {
            return true;
        }

        // Lấy IP của Client (Hỗ trợ cả trường hợp dùng Load Balancer/Proxy)
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }
        
        // Tạo khoá Redis dựa trên IP và Endpoint
        String key = "rate_limit:register:" + clientIp;

        long currentTime = System.currentTimeMillis();
        long windowStart = currentTime - (TIME_WINDOW_SECONDS * 1000L);

        // 1. Xoá các request cũ hơn cửa sổ 10 giây
        redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);

        // 2. Đếm số lượng request còn lại trong 10 giây qua
        Long currentCount = redisTemplate.opsForZSet().zCard(key);

        // 3. Nếu số lượng >= MAX_REQUESTS -> Chặn
        if (currentCount != null && currentCount >= MAX_REQUESTS) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value()); // 429
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\": \"Bạn đang gửi yêu cầu quá nhanh. Vui lòng thử lại sau 10 giây!\"}");
            return false; // Chặn request không cho đi tiếp vào Controller
        }

        // 4. Nếu chưa vượt quá, thêm request hiện tại vào ZSET
        // Dùng UUID để tránh trùng lặp value nếu 2 request đến cùng một mili-giây
        String value = currentTime + "-" + java.util.UUID.randomUUID().toString();
        redisTemplate.opsForZSet().add(key, value, currentTime);
        
        // Cập nhật lại thời gian sống của key để dọn dẹp bộ nhớ Redis
        redisTemplate.expire(key, Duration.ofSeconds(TIME_WINDOW_SECONDS));

        return true;
    }
}
