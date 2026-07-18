package com.rookies5.Backend_MATE.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    public static final String CLAIM_TOKEN_TYPE = "tokenType";
    public static final String TOKEN_TYPE_ACCESS = "access";
    public static final String TOKEN_TYPE_REFRESH = "refresh";

    private final SecretKey key;
    private final CustomUserDetailsService userDetailsService;

    // API 명세서 규칙: 액세스 토큰 1시간, 리프레시 토큰 7일 설정
    private final long accessTokenValidityTime = 60 * 60 * 1000L;
    private final long refreshTokenValidityTime = 7 * 24 * 60 * 60 * 1000L;

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey, CustomUserDetailsService userDetailsService) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.userDetailsService = userDetailsService;
    }

    // 1. Access Token 생성 (1시간짜리)
    public String createAccessToken(Authentication authentication) {
        return createToken(authentication, accessTokenValidityTime, TOKEN_TYPE_ACCESS);
    }

    // 2. Refresh Token 생성 (7일짜리)
    public String createRefreshToken(Authentication authentication) {
        return createToken(authentication, refreshTokenValidityTime, TOKEN_TYPE_REFRESH);
    }

    // 내부에서 토큰을 찍어내는 공통 메서드
    private String createToken(Authentication authentication, long validityTime, String tokenType) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        Date validity = new Date(now + validityTime);

        return Jwts.builder()
                .subject(authentication.getName())
                .claim("auth", authorities)
                .claim(CLAIM_TOKEN_TYPE, tokenType)
                .expiration(validity)
                .signWith(key)
                .compact();
    }

    // 3. 토큰을 열어서 안에 있는 유저 정보(Authentication)를 꺼내는 메서드
    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);

        UserDetails principal = userDetailsService.loadUserByUsername(claims.getSubject());

        return new UsernamePasswordAuthenticationToken(principal, token, principal.getAuthorities());
    }

    // 4. 토큰이 위조되지 않았는지, 만료되지 않았는지 검사하는 메서드
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.info("유효하지 않거나 만료된 JWT 토큰입니다.");
        }
        return false;
    }

    public boolean isAccessToken(String token) {
        return TOKEN_TYPE_ACCESS.equals(getTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return TOKEN_TYPE_REFRESH.equals(getTokenType(token));
    }

    public String getTokenType(String token) {
        try {
            Claims claims = parseClaims(token);
            Object type = claims.get(CLAIM_TOKEN_TYPE);
            return type != null ? type.toString() : null;
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
