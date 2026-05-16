package com.unihub.workshop.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.beans.factory.annotation.Value;

import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // Dùng bộ nhớ RAM thay cho Redis để dễ dàng test cục bộ mọi tính năng
    private final ConcurrentHashMap<String, Queue<Long>> requestCounts = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.enabled:true}")
    private boolean isEnabled;
    
    // Tối đa 5 request trong vòng 10 giây
    private static final int MAX_REQUESTS = 5;
    private static final int TIME_WINDOW_SECONDS = 10;

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
        
        String key = "rate_limit:register:" + clientIp;

        long currentTime = System.currentTimeMillis();
        long windowStart = currentTime - (TIME_WINDOW_SECONDS * 1000L);

        requestCounts.putIfAbsent(key, new ConcurrentLinkedQueue<>());
        Queue<Long> timestamps = requestCounts.get(key);

        // Đồng bộ hóa (synchronized) trên chính hàng đợi của IP này 
        // để đảm bảo tính nguyên tử (atomic) giống hệt như Redis xử lý!
        synchronized (timestamps) {
            // Xóa các request cũ hơn cửa sổ 10 giây
            while (!timestamps.isEmpty() && timestamps.peek() < windowStart) {
                timestamps.poll();
            }

            // Nếu số lượng >= MAX_REQUESTS -> Chặn
            if (timestamps.size() >= MAX_REQUESTS) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value()); // 429
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\": \"Bạn đang gửi yêu cầu quá nhanh. Vui lòng thử lại sau 10 giây!\"}");
                return false; // Chặn request không cho đi tiếp vào Controller
            }

            // Nếu chưa vượt quá, thêm request hiện tại
            timestamps.offer(currentTime);
        }
        
        return true;
    }
}
