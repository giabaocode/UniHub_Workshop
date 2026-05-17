package com.unihub.workshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Đã bỏ exclude RedisAutoConfiguration để hệ thống tận dụng Redis cho rate limit
 * và fairness queue. Khi Redis offline, các thành phần phụ thuộc tự fallback
 * sang in-memory (xem RateLimitInterceptor).
 */
@SpringBootApplication
@EnableScheduling
@EnableAsync
public class WorkshopApplication {
	@org.springframework.beans.factory.annotation.Autowired
	private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

	@jakarta.annotation.PostConstruct
	public void fixNullVersions() {
		jdbcTemplate.execute("UPDATE workshop SET version = 0 WHERE version IS NULL");
	}

	public static void main(String[] args) {
		SpringApplication.run(WorkshopApplication.class, args);
	}

}
