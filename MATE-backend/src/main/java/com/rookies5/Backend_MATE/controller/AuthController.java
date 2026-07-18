package com.rookies5.Backend_MATE.controller;

import com.rookies5.Backend_MATE.common.SuccessResponse;
import com.rookies5.Backend_MATE.dto.request.LoginRequestDto;
import com.rookies5.Backend_MATE.dto.request.UserRequestDto;
import com.rookies5.Backend_MATE.dto.response.AuthResponseDto;
import com.rookies5.Backend_MATE.dto.response.AuthSessionDto;
import com.rookies5.Backend_MATE.dto.response.UserResponseDto;
import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import com.rookies5.Backend_MATE.service.AuthService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.rookies5.Backend_MATE.security.RefreshTokenCookieManager;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    /**
     * Uniform message for self-service recovery endpoints while no verified
     * email/SMS delivery channel is configured. Same body for all callers —
     * no account existence signal.
     */
    public static final String SELF_SERVICE_RECOVERY_UNAVAILABLE =
            "셀프서비스 계정 복구는 현재 이용할 수 없습니다. 관리자에게 문의해 주세요.";

    private final AuthService authService;
    private final RefreshTokenCookieManager refreshTokenCookieManager;
    // ✅ UserRepository 의존성 완전 제거 (비즈니스 로직은 Service에서만!)

    /**
     * 1. 회원가입 (Signup) - 기본 이미지 자동 할당 (JSON 방식)
     */
    @PostMapping("/signup")
    public SuccessResponse<UserResponseDto> signup(@RequestBody @Valid UserRequestDto requestDto) {
        log.info("회원가입 요청: {}", requestDto.getEmail());
        UserResponseDto responseDto = authService.register(requestDto);
        return new SuccessResponse<>("회원가입이 성공적으로 완료되었습니다.", responseDto);
    }

    /**
     * 2. 이메일 중복 확인
     */
    @GetMapping("/check-email")
    public SuccessResponse<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        log.info("이메일 중복 확인 요청: {}", email);

        // 서비스 내부에서 중복 시 USER_002, 형식 오류 시 AUTH_INVALID_CREDENTIALS 투척!
        boolean isAvailable = authService.isEmailAvailable(email);
        return new SuccessResponse<>("사용 가능한 이메일입니다.", Map.of("isAvailable", isAvailable));
    }

    /**
     * 3. 닉네임 중복 확인
     */
    @GetMapping("/check-nickname")
    public SuccessResponse<Map<String, Boolean>> checkNickname(
            @RequestParam String nickname,
            @RequestParam(required = false) Long userId) {
        log.info("닉네임 중복 확인 요청: {} (userId: {})", nickname, userId);
        // 서비스 내부에서 중복 시 USER_003, 형식 오류 시 USER_007 투척!
        boolean isAvailable = authService.isNicknameAvailable(nickname, userId);
        return new SuccessResponse<>("사용 가능한 닉네임입니다.", Map.of("isAvailable", isAvailable));
    }

    /**
     * 4. 전화번호 중복 확인
     * GET /api/auth/check-phone?phoneNumber=01011112222&userId=1
     */
    @GetMapping("/check-phone")
    public SuccessResponse<Map<String, Boolean>> checkPhone(
            @RequestParam String phoneNumber,
            @RequestParam(required = false) Long userId) {
        log.info("전화번호 중복 확인 요청: {} (userId: {})", phoneNumber, userId);
        boolean isAvailable = authService.isPhoneAvailable(phoneNumber, userId);
        return new SuccessResponse<>("사용 가능한 전화번호입니다.", Map.of("isAvailable", isAvailable));
    }

    /**
     * 5. 아이디(이메일) 찾기 — interim privacy-safe stub.
     * No user lookup or email exposure until a verified delivery channel exists
     * (avoids registration enumeration / timing side channels).
     */
    @PostMapping("/find-email")
    public SuccessResponse<String> findEmail(@RequestBody Map<String, String> request) {
        log.info("아이디(이메일) 찾기 요청");
        return new SuccessResponse<>(SELF_SERVICE_RECOVERY_UNAVAILABLE, "OK");
    }

    /**
     * 6. 비밀번호 재설정 — interim privacy-safe stub.
     * No lookup, password mutation, or session revocation until a verified
     * delivery channel exists (avoids account-lockout DoS without credential delivery).
     */
    @PostMapping("/reset-password")
    public SuccessResponse<String> resetPassword(@RequestBody UserRequestDto requestDto) {
        log.info("비밀번호 재설정 요청");
        return new SuccessResponse<>(SELF_SERVICE_RECOVERY_UNAVAILABLE, "OK");
    }

    /**
     * 7. 로그인 (JWT 토큰 발급) - 규격 통일
     */
    @PostMapping("/login")
    public SuccessResponse<AuthResponseDto> login(
            @RequestBody @Valid LoginRequestDto requestDto,
            HttpServletResponse response) {
        log.info("로그인 요청: {}", requestDto.getEmail());

        AuthSessionDto session = authService.login(requestDto.getEmail(), requestDto.getPassword());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookieManager.create(session.refreshToken()));
        return new SuccessResponse<>("로그인에 성공하였습니다.", session.response());
    }

    /**
     * 8. 로그아웃 - 규격 통일
     * ✅ Controller에서 UserRepository 직접 조회하던 로직을 Service로 이동
     */
    @PostMapping("/logout")
    public SuccessResponse<Void> logout(Authentication authentication, HttpServletResponse response) {
        log.info("로그아웃 요청");
        // ✅ 이메일만 꺼내서 Service로 넘김 (DB 조회는 Service 책임)
        String email = authentication.getName();
        authService.logout(email);
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookieManager.clear());
        return new SuccessResponse<>("로그아웃이 성공적으로 완료되었습니다.");
    }

    /**
     * 9. 토큰 재발급 API - 규격 통일
     */
    @PostMapping("/refresh")
    public SuccessResponse<AuthResponseDto> refresh(
            @CookieValue(name = RefreshTokenCookieManager.COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response) {
        log.info("토큰 재발급 요청");
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new BusinessException(ErrorCode.REQUIRED_FIELD_MISSING);
        }
        AuthSessionDto session = authService.refresh(refreshToken);
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookieManager.create(session.refreshToken()));
        return new SuccessResponse<>("토큰이 성공적으로 재발급되었습니다.", session.response());
    }
}
