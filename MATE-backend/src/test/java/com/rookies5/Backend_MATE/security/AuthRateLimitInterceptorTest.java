package com.rookies5.Backend_MATE.security;

import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthRateLimitInterceptorTest {

    @Test
    @DisplayName("Login requests over the configured window limit return AUTH_006")
    void loginLimitIsEnforcedPerClientAndPath() {
        AuthRateLimitInterceptor interceptor = new AuthRateLimitInterceptor(
                true, 2, 1, 60,
                Clock.fixed(Instant.parse("2026-07-19T00:00:00Z"), ZoneOffset.UTC)
        );
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("127.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        interceptor.preHandle(request, response, new Object());
        interceptor.preHandle(request, response, new Object());

        assertThatThrownBy(() -> interceptor.preHandle(request, response, new Object()))
                .isInstanceOf(BusinessException.class)
                .extracting(error -> ((BusinessException) error).getErrorCode())
                .isEqualTo(ErrorCode.AUTH_RATE_LIMIT_EXCEEDED);
    }
}
