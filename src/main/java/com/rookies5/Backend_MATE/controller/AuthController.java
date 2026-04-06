package com.rookies5.Backend_MATE.controller;

import com.rookies5.Backend_MATE.common.SuccessResponse;
import com.rookies5.Backend_MATE.dto.request.LoginRequestDto;
import com.rookies5.Backend_MATE.dto.request.UserRequestDto;
import com.rookies5.Backend_MATE.dto.response.AuthResponseDto;
import com.rookies5.Backend_MATE.dto.response.UserResponseDto;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import com.rookies5.Backend_MATE.repository.UserRepository;
import com.rookies5.Backend_MATE.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    /**
     * 1. 회원가입 (Signup) - 기본 이미지 자동 할당 (JSON 방식)
     */
    @PostMapping("/signup")
    public SuccessResponse<UserResponseDto> signup(@RequestBody @Valid UserRequestDto requestDto) {
        log.info("회원가입 요청: {}", requestDto.getEmail());

        // profileImage 파라미터 삭제!
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

        Map<String, Boolean> data = new HashMap<>();
        data.put("isAvailable", isAvailable);
        return new SuccessResponse<>("사용 가능한 이메일입니다.", data);
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

        Map<String, Boolean> data = new HashMap<>();
        data.put("isAvailable", isAvailable);
        return new SuccessResponse<>("사용 가능한 닉네임입니다.", data);
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

        // 서비스 호출 시 userId 전달
        boolean isAvailable = authService.isPhoneAvailable(phoneNumber, userId);

        Map<String, Boolean> data = new HashMap<>();
        data.put("isAvailable", isAvailable);

        return new SuccessResponse<>("사용 가능한 전화번호입니다.", data);
    }

    /**
     * 5. 아이디(이메일) 찾기 - 규격 통일
     */
    @PostMapping("/find-email")
    public SuccessResponse<String> findEmail(@RequestBody Map<String, String> request) {
        // 💡 1. 프론트엔드가 보낸 택배 박스(JSON) 전체를 그대로 출력해 봅니다.
        log.info("📦 프론트에서 넘어온 데이터 전체: {}", request);

        String phoneNumber = request.get("phoneNumber");

        // 💡 2. 우리가 'phoneNumber'라는 이름으로 꺼낸 값이 잘 있는지 확인합니다.
        log.info("📞 추출된 전화번호: {}", phoneNumber);

        String email = authService.findEmailByPhoneNumber(phoneNumber);

        return new SuccessResponse<>("이메일 찾기에 성공하였습니다.", email);
    }

    /**
     * 6. 비밀번호 재설정 (임시 비번 발급) - 규격 통일 (@RequestParam -> @RequestBody 변경)
     */
    @PostMapping("/reset-password")
    public SuccessResponse<String> resetPassword(@RequestBody Map<String, String> request) {

        // 프론트가 보낸 JSON 박스에서 이메일과 전화번호를 꺼냅니다.
        String email = request.get("email");
        String phoneNumber = request.get("phoneNumber");
        log.info("비밀번호 재설정 요청: email={}, phoneNumber={}", email, phoneNumber);

        String newPassword = authService.resetPassword(email, phoneNumber);

        return new SuccessResponse<>("임시 비밀번호가 발급되었습니다. 로그인 후 비밀번호를 변경해 주세요.", newPassword);
    }

    /**
     * 7. 로그인 (JWT 토큰 발급) - 규격 통일
     */
    @PostMapping("/login")
    public SuccessResponse<AuthResponseDto> login(@RequestBody @Valid LoginRequestDto requestDto) {
        log.info("로그인 요청: {}", requestDto.getEmail());

        // 👇 💡 두 번째 CCTV: 프론트가 보낸 비밀번호 양옆에 대괄호 [ ] 를 씌워서 기록!
        log.info("🔑 [2. 프론트 전송] 로그인 시도 비밀번호: [{}]", requestDto.getPassword());

        AuthResponseDto responseDto = authService.login(requestDto.getEmail(), requestDto.getPassword());

        return new SuccessResponse<>("로그인에 성공하였습니다.", responseDto);
    }

    /**
     * 8. 로그아웃 - 규격 통일
     */
    @PostMapping("/logout")
    public SuccessResponse<Void> logout(Authentication authentication) {
        log.info("로그아웃 요청");

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        authService.logout(user.getId());

        // 데이터가 없을 때는 메시지만 담는 생성자 사용
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