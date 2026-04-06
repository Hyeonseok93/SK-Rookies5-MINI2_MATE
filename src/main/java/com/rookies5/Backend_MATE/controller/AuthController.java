package com.rookies5.Backend_MATE.controller;

import com.rookies5.Backend_MATE.common.SuccessResponse;
import com.rookies5.Backend_MATE.dto.request.LoginRequestDto;
import com.rookies5.Backend_MATE.dto.request.UserRequestDto;
import com.rookies5.Backend_MATE.dto.response.AuthResponseDto;
import com.rookies5.Backend_MATE.dto.response.UserResponseDto;
import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import com.rookies5.Backend_MATE.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
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
     * 5. 아이디(이메일) 찾기 - 규격 통일
     */
    @GetMapping("/find-email")
    public SuccessResponse<String> findEmail(@RequestParam String phoneNumber) {
        log.info("이메일 찾기 요청: {}", phoneNumber);
        String email = authService.findEmailByPhoneNumber(phoneNumber);
        return new SuccessResponse<>("이메일 찾기에 성공하였습니다.", email);
    }

    /**
     * 6. 비밀번호 재설정 (임시 비번 발급) - 규격 통일
     */
    @PostMapping("/reset-password")
    public SuccessResponse<String> resetPassword(@RequestParam String email, @RequestParam String phoneNumber) {
        log.info("비밀번호 재설정 요청: {}", email);
        String newPassword = authService.resetPassword(email, phoneNumber);
        return new SuccessResponse<>("임시 비밀번호가 발급되었습니다. 로그인 후 비밀번호를 변경해 주세요.", newPassword);
    }

    /**
     * 7. 로그인 (JWT 토큰 발급) - 규격 통일
     */
    @PostMapping("/login")
    public SuccessResponse<AuthResponseDto> login(@RequestBody @Valid LoginRequestDto requestDto) {
        log.info("로그인 요청: {}", requestDto.getEmail());
        AuthResponseDto responseDto = authService.login(requestDto.getEmail(), requestDto.getPassword());
        return new SuccessResponse<>("로그인에 성공하였습니다.", responseDto);
    }

    /**
     * 8. 로그아웃 - 규격 통일
     * ✅ Controller에서 UserRepository 직접 조회하던 로직을 Service로 이동
     */
    @PostMapping("/logout")
    public SuccessResponse<Void> logout(Authentication authentication) {
        log.info("로그아웃 요청");
        // ✅ 이메일만 꺼내서 Service로 넘김 (DB 조회는 Service 책임)
        String email = authentication.getName();
        authService.logout(email);
        return new SuccessResponse<>("로그아웃이 성공적으로 완료되었습니다.");
    }

    /**
     * 9. 토큰 재발급 API - 규격 통일
     */
    @PostMapping("/refresh")
    public SuccessResponse<AuthResponseDto> refresh(@RequestBody Map<String, String> request) {
        log.info("토큰 재발급 요청");
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new BusinessException(ErrorCode.REQUIRED_FIELD_MISSING);
        }
        AuthResponseDto responseDto = authService.refresh(refreshToken);
        return new SuccessResponse<>("토큰이 성공적으로 재발급되었습니다.", responseDto);
    }
}
