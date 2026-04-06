package com.rookies5.Backend_MATE.service;

import com.rookies5.Backend_MATE.dto.request.UserRequestDto;
import com.rookies5.Backend_MATE.dto.response.AuthResponseDto;
import com.rookies5.Backend_MATE.dto.response.UserResponseDto;

public interface AuthService {

    /**
     * 1. 회원가입
     */
    UserResponseDto register(UserRequestDto requestDto);

    /**
     * 2. 로그인
     */
    AuthResponseDto login(String email, String password);

    /**
     * 3. 이메일 중복 및 유효성 확인
     */
    boolean isEmailAvailable(String email);

    /**
     * 4. 전화번호 중복 및 유효성 확인 (가입/수정 공용)
     */
    boolean isPhoneAvailable(String phoneNumber, Long userId);

    /**
     * 5. 닉네임 중복 및 유효성 확인 (가입/수정 공용)
     */
    boolean isNicknameAvailable(String nickname, Long userId);

    /**
     * 6. 아이디(이메일) 찾기
     */
    String findEmailByPhoneNumber(String phoneNumber);

    /**
     * 7. 비밀번호 재설정 (임시 비밀번호 발급)
     */
    String resetPassword(String email, String phoneNumber);

    /**
     * 8. 로그아웃
     * ✅ userId → email 로 변경 (Controller에서 DB 조회 제거)
     */
    void logout(String email);

    /**
     * 9. 토큰 재발급
     */
    AuthResponseDto refresh(String refreshToken);
}
