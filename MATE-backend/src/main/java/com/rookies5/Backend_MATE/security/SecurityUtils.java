package com.rookies5.Backend_MATE.security;

import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * SecurityContext에서 현재 로그인한 사용자 정보를 꺼내는 유틸리티 클래스
 */
public class SecurityUtils {

    /**
     * 현재 로그인한 사용자의 ID(PK)를 반환합니다.
     */
    public static Long getCurrentUserId() {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
        }

        // JwtTokenProvider에서 CustomUserDetails를 넣어줬으므로 여기서 꺼낼 수 있음
        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) authentication.getPrincipal()).getUser().getId();
        }

        throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
    }
}