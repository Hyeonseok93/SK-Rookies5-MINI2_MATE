package com.rookies5.Backend_MATE.repository;

import com.rookies5.Backend_MATE.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    // 유저 ID로 해당 유저의 리프레시 토큰 찾기 (발급/갱신 시 사용)
    Optional<RefreshToken> findByUserId(Long userId);
    
    // 토큰 값 자체로 엔티티 찾기 (프론트가 보낸 토큰이 DB에 있는지 검증할 때 사용)
    Optional<RefreshToken> findByTokenValue(String tokenValue);
    
    // 유저 ID로 리프레시 토큰 삭제 (로그아웃 시 사용)
    void deleteByUserId(Long userId);
}