package com.rookies5.Backend_MATE.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 유저의 토큰인지 식별 (1인 1기기 로그인을 가정하여 unique = true 설정)
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    // JWT 토큰은 길이가 길 수 있으므로 넉넉하게 512자 또는 그 이상으로 잡습니다.
    @Column(name = "token_value", nullable = false, length = 512)
    private String tokenValue;

    @Builder
    public RefreshToken(Long userId, String tokenValue) {
        this.userId = userId;
        this.tokenValue = tokenValue;
    }

    // 기존 토큰을 새로운 토큰으로 교체할 때 사용하는 메서드 (더티 체킹용)
    public void updateToken(String tokenValue) {
        this.tokenValue = tokenValue;
    }
}