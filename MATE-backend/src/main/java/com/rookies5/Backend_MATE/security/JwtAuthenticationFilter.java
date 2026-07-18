package com.rookies5.Backend_MATE.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// 모든 요청 앞에서 토큰을 검사하는 보안 필터
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolveToken(request);

        try {
            if (token != null) {
                if (jwtTokenProvider.validateToken(token)) {
                    // Refresh 토큰은 Bearer 인증에 사용할 수 없음
                    if (!jwtTokenProvider.isAccessToken(token)) {
                        log.warn("Refresh 토큰이 Authorization Bearer로 사용되어 거부되었습니다.");
                        SecurityContextHolder.clearContext();
                    } else {
                        Authentication authentication = jwtTokenProvider.getAuthentication(token);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } else if (jwtTokenProvider.isTokenExpired(token)) {
                    // 프론트 silent refresh가 AUTH_002를 보고 쿠키 갱신을 시도하도록 표시한다.
                    request.setAttribute("jwtException", "expired");
                    SecurityContextHolder.clearContext();
                }
            }
        } catch (Exception e) {
            log.warn("유효하지 않은 토큰 요청입니다 (상세조회 및 이미지 허용을 위해 통과): {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
