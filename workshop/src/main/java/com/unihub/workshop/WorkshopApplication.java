package com.unihub.workshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class
})
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
