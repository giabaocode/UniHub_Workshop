package com.unihub.workshop.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Collections;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Sliding-window rate limit cho /api/tickets/register/**.
 *
 *  - Khi Redis khả dụng (mode "auto" hoặc "redis"): dùng Lua script ZSET để tính
 *    sliding window, atomic, đồng bộ giữa nhiều node — chống được spike thật.
 *  - Khi Redis chết (mode "auto" sau khi probe lỗi) hoặc cấu hình "memory":
 *    fallback sang ConcurrentHashMap (chỉ chính xác trong cùng JVM).
 *
 * Có 2 lớp giới hạn để giữ "fairness":
 *  1. Theo IP — chống bot/DDoS.
 *  2. Theo userId (nếu đã đăng nhập) — đảm bảo 1 sinh viên không spam được, vé
 *     phân phối công bằng giữa các tài khoản.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    @Value("${app.rate-limit.enabled:true}")
    private boolean isEnabled;

    @Value("${app.rate-limit.max-requests:5}")
    private int maxRequests;

    @Value("${app.rate-limit.window-seconds:10}")
    private int windowSeconds;

    @Value("${app.rate-limit.user.max-requests:3}")
    private int maxRequestsPerUser;

    @Value("${app.rate-limit.user.window-seconds:10}")
    private int windowSecondsPerUser;

    @Value("${app.rate-limit.store:auto}")
    private String storeMode;

    @Nullable
    private final StringRedisTemplate redisTemplate;
    @Nullable
    private final RedisConnectionFactory redisConnectionFactory;
    @Nullable
    private final RedisScript<Long> rateLimitScript;

    // Fallback in-memory store (per JVM)
    private final ConcurrentHashMap<String, Queue<Long>> requestCounts = new ConcurrentHashMap<>();
    private volatile long lastRedisFailureMillis = 0L;
    private static final long REDIS_FAILURE_BACKOFF_MS = 5_000L;

    public RateLimitInterceptor(@Nullable StringRedisTemplate redisTemplate,
                                @Nullable RedisConnectionFactory redisConnectionFactory,
                                @Nullable RedisScript<Long> rateLimitScript) {
        this.redisTemplate = redisTemplate;
        this.redisConnectionFactory = redisConnectionFactory;
        this.rateLimitScript = rateLimitScript;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!isEnabled) {
            return true;
        }

        String clientIp = resolveClientIp(request);
        String ipKey = "rate_limit:register:ip:" + clientIp;

        if (!allow(ipKey, maxRequests, windowSeconds * 1000L)) {
            return reject(response, "Bạn đang gửi yêu cầu quá nhanh. Vui lòng thử lại sau " + windowSeconds + " giây!");
        }

        // Lớp 2: theo user (nếu đăng nhập) — fairness
        String userKey = resolveUserKey();
        if (userKey != null) {
            if (!allow("rate_limit:register:user:" + userKey, maxRequestsPerUser, windowSecondsPerUser * 1000L)) {
                return reject(response, "Bạn đang đăng ký quá nhanh. Hãy nhường lượt cho các bạn khác trong " + windowSecondsPerUser + " giây.");
            }
        }

        return true;
    }

    private boolean allow(String key, int limit, long windowMillis) {
        if (shouldUseRedis()) {
            try {
                Long allowed = redisTemplate.execute(
                        rateLimitScript,
                        Collections.singletonList(key),
                        String.valueOf(System.currentTimeMillis()),
                        String.valueOf(windowMillis),
                        String.valueOf(limit)
                );
                return allowed != null && allowed == 1L;
            } catch (RuntimeException ex) {
                // Redis sập — đánh dấu để tạm thời dùng memory, log tối thiểu
                lastRedisFailureMillis = System.currentTimeMillis();
                System.err.println("[RateLimit] Redis lỗi, fallback sang in-memory: " + ex.getMessage());
            }
        }
        return allowInMemory(key, limit, windowMillis);
    }

    private boolean allowInMemory(String key, int limit, long windowMillis) {
        long now = System.currentTimeMillis();
        long windowStart = now - windowMillis;

        Queue<Long> timestamps = requestCounts.computeIfAbsent(key, k -> new ConcurrentLinkedQueue<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peek() < windowStart) {
                timestamps.poll();
            }
            if (timestamps.size() >= limit) {
                return false;
            }
            timestamps.offer(now);
            return true;
        }
    }

    private boolean shouldUseRedis() {
        if (redisTemplate == null || rateLimitScript == null) {
            return false;
        }
        if ("memory".equalsIgnoreCase(storeMode)) {
            return false;
        }
        if ("redis".equalsIgnoreCase(storeMode)) {
            return true;
        }
        // auto: nếu Redis vừa fail, đợi backoff để tránh hammer connection
        if (System.currentTimeMillis() - lastRedisFailureMillis < REDIS_FAILURE_BACKOFF_MS) {
            return false;
        }
        return true;
    }

    private boolean reject(HttpServletResponse response, String message) throws java.io.IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message.replace("\"", "\\\"") + "\"}");
        return false;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String header = request.getHeader("X-Forwarded-For");
        if (header != null && !header.isBlank()) {
            // X-Forwarded-For có thể là chuỗi nhiều IP, lấy IP đầu (client gốc)
            int comma = header.indexOf(',');
            return comma > 0 ? header.substring(0, comma).trim() : header.trim();
        }
        String real = request.getHeader("X-Real-IP");
        if (real != null && !real.isBlank()) {
            return real.trim();
        }
        return request.getRemoteAddr();
    }

    @Nullable
    private String resolveUserKey() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof com.unihub.workshop.entity.User user) {
            return String.valueOf(user.getId());
        }
        String name = auth.getName();
        return name == null || name.isBlank() ? null : name;
    }
}
