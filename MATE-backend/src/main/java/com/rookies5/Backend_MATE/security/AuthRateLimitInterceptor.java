package com.rookies5.Backend_MATE.security;

import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class AuthRateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final AtomicLong requestCounter = new AtomicLong();
    private final Clock clock;
    private final boolean enabled;
    private final int loginLimit;
    private final int recoveryLimit;
    private final long windowMillis;

    @Autowired
    public AuthRateLimitInterceptor(
            @Value("${auth.rate-limit.enabled:true}") boolean enabled,
            @Value("${auth.rate-limit.login-limit:5}") int loginLimit,
            @Value("${auth.rate-limit.recovery-limit:3}") int recoveryLimit,
            @Value("${auth.rate-limit.window-seconds:60}") long windowSeconds) {
        this(enabled, loginLimit, recoveryLimit, windowSeconds, Clock.systemUTC());
    }

    AuthRateLimitInterceptor(boolean enabled, int loginLimit, int recoveryLimit,
                             long windowSeconds, Clock clock) {
        this.enabled = enabled;
        this.loginLimit = loginLimit;
        this.recoveryLimit = recoveryLimit;
        this.windowMillis = windowSeconds * 1_000;
        this.clock = clock;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!enabled) {
            return true;
        }

        String path = request.getRequestURI();
        int limit = path.endsWith("/login") ? loginLimit : recoveryLimit;
        String key = request.getRemoteAddr() + ':' + path;
        long now = clock.millis();

        Window window = windows.compute(key, (ignored, current) -> {
            if (current == null || now >= current.startedAt + windowMillis) {
                return new Window(now, 1);
            }
            current.count++;
            return current;
        });

        if (requestCounter.incrementAndGet() % 1_000 == 0) {
            windows.entrySet().removeIf(entry -> now >= entry.getValue().startedAt + windowMillis);
        }

        if (window.count > limit) {
            throw new BusinessException(ErrorCode.AUTH_RATE_LIMIT_EXCEEDED);
        }
        return true;
    }

    private static final class Window {
        private final long startedAt;
        private int count;

        private Window(long startedAt, int count) {
            this.startedAt = startedAt;
            this.count = count;
        }
    }
}
