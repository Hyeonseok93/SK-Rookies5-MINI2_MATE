package com.rookies5.Backend_MATE.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class RefreshTokenCookieManager {

    public static final String COOKIE_NAME = "mate_refresh";

    private final boolean secure;
    private final String sameSite;
    private final Duration maxAge;

    public RefreshTokenCookieManager(
            @Value("${auth.refresh-cookie.secure:false}") boolean secure,
            @Value("${auth.refresh-cookie.same-site:Lax}") String sameSite,
            @Value("${auth.refresh-cookie.max-age:604800}") long maxAgeSeconds) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.maxAge = Duration.ofSeconds(maxAgeSeconds);
    }

    public String create(String refreshToken) {
        return baseCookie(refreshToken)
                .maxAge(maxAge)
                .build()
                .toString();
    }

    public String clear() {
        return baseCookie("")
                .maxAge(Duration.ZERO)
                .build()
                .toString();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/api/auth");
    }
}
