package com.rookies5.Backend_MATE.config;

import com.rookies5.Backend_MATE.security.AuthRateLimitInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class RateLimitConfig implements WebMvcConfigurer {

    private final AuthRateLimitInterceptor authRateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authRateLimitInterceptor)
                .addPathPatterns(
                        "/api/auth/login",
                        "/api/auth/find-email",
                        "/api/auth/reset-password"
                );
    }
}
