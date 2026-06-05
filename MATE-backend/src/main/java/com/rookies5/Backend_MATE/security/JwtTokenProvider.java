package com.rookies5.Backend_MATE.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final CustomUserDetailsService userDetailsService; // [추가] 유저 정보 로드용

    // API 명세서 규칙: 액세스 토큰 1시간, 리프레시 토큰 7일 설정
    private final long accessTokenValidityTime = 60 * 60 * 1000L;
    private final long refreshTokenValidityTime = 7 * 24 * 60 * 60 * 1000L;

    // application-dev.properties에 있는 비밀키를 가져와서 암호화 키로 변환
    // [수정] CustomUserDetailsService 생성자 주입 추가
    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey, CustomUserDetailsService userDetailsService) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.userDetailsService = userDetailsService; // [추가]
    }

    // 1. Access Token 생성 (1시간짜리)
    public String createAccessToken(Authentication authentication) {
        return createToken(authentication, accessTokenValidityTime);
    }

    // 2. Refresh Token 생성 (7일짜리)
    public String createRefreshToken(Authentication authentication) {
        return createToken(authentication, refreshTokenValidityTime);
    }

    // 내부에서 토큰을 찍어내는 공통 메서드
    private String createToken(Authentication authentication, long validityTime) {
        // 유저의 권한(Role) 정보 가져오기
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        Date validity = new Date(now + validityTime);

        return Jwts.builder()
                .subject(authentication.getName()) // 유저 ID (이메일)
                .claim("auth", authorities) // 권한 정보 (예: ROLE_USER)
                .expiration(validity) // 만료 시간
                .signWith(key) // 비밀키로 서명
                .compact();
    }

    // 3. 토큰을 열어서 안에 있는 유저 정보(Authentication)를 꺼내는 메서드
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();

        // [수정] DB에서 최신 유저 정보를 가져와서 CustomUserDetails로 포장
        UserDetails principal = userDetailsService.loadUserByUsername(claims.getSubject());

        return new UsernamePasswordAuthenticationToken(principal, token, principal.getAuthorities());
    }

    // 4. 토큰이 위조되지 않았는지, 만료되지 않았는지 검사하는 메서드
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.info("유효하지 않거나 만료된 JWT 토큰입니다.");
        }
        return false;
    }
}