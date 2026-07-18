package com.rookies5.Backend_MATE.security;

import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import com.rookies5.Backend_MATE.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class JwtTokenTypeTest {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("Access and refresh tokens include distinct tokenType claims")
    void tokensContainTypeClaim() {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "jwt-type@mate.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        String access = jwtTokenProvider.createAccessToken(authentication);
        String refresh = jwtTokenProvider.createRefreshToken(authentication);

        assertThat(jwtTokenProvider.isAccessToken(access)).isTrue();
        assertThat(jwtTokenProvider.isRefreshToken(access)).isFalse();
        assertThat(jwtTokenProvider.isRefreshToken(refresh)).isTrue();
        assertThat(jwtTokenProvider.isAccessToken(refresh)).isFalse();
        assertThat(jwtTokenProvider.getTokenType(access)).isEqualTo(JwtTokenProvider.TOKEN_TYPE_ACCESS);
        assertThat(jwtTokenProvider.getTokenType(refresh)).isEqualTo(JwtTokenProvider.TOKEN_TYPE_REFRESH);
    }

    @Test
    @DisplayName("Refresh endpoint rejects access tokens")
    void refreshRejectsAccessToken() {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "jwt-refresh@mate.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        String access = jwtTokenProvider.createAccessToken(authentication);

        assertThatThrownBy(() -> authService.refresh(access))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getErrorCode())
                .isEqualTo(ErrorCode.AUTH_TOKEN_INVALID);
    }
}