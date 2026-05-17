package com.unihub.workshop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;

/**
 * Cấu hình Redis client + Lua script cho sliding-window rate limit.
 * Atomic 100% bằng EVAL nên chống được race condition khi spike traffic.
 */
@Configuration
public class RedisConfig {

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        StringRedisTemplate template = new StringRedisTemplate();
        template.setConnectionFactory(connectionFactory);
        return template;
    }

    /**
     * Sliding window rate-limit.
     * KEYS[1] = bucket key
     * ARGV[1] = now (millis)
     * ARGV[2] = window (millis)
     * ARGV[3] = limit (max requests)
     * Trả về 1 nếu cho phép, 0 nếu chặn.
     */
    @Bean(name = "rateLimitScript")
    public DefaultRedisScript<Long> rateLimitScript() {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setScriptText(
                "local now = tonumber(ARGV[1])\n" +
                "local window = tonumber(ARGV[2])\n" +
                "local limit = tonumber(ARGV[3])\n" +
                "local windowStart = now - window\n" +
                "redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, windowStart)\n" +
                "local count = redis.call('ZCARD', KEYS[1])\n" +
                "if count >= limit then\n" +
                "  return 0\n" +
                "end\n" +
                "redis.call('ZADD', KEYS[1], now, now .. ':' .. math.random())\n" +
                "redis.call('PEXPIRE', KEYS[1], window)\n" +
                "return 1\n"
        );
        script.setResultType(Long.class);
        return script;
    }
}
