package com.rookies5.Backend_MATE.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class JwtExpiredAccessTokenTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    @Value("${jwt.secret}")
    private String secretKey;

    @Test
    @DisplayName("만료된 Access Token은 AUTH_002를 반환해 silent refresh를 유도한다")
    void expiredAccessTokenReturnsAuth002() throws Exception {
        String expired = createExpiredAccessToken("expired-user@mate.com");

        assertThat(jwtTokenProvider.validateToken(expired)).isFalse();
        assertThat(jwtTokenProvider.isTokenExpired(expired)).isTrue();

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + expired))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("AUTH_002"));
    }

    private String createExpiredAccessToken(String subject) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
        Date expiredAt = new Date(System.currentTimeMillis() - 60_000L);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(subject)
                .claim("auth", "ROLE_USER")
                .claim(JwtTokenProvider.CLAIM_TOKEN_TYPE, JwtTokenProvider.TOKEN_TYPE_ACCESS)
                .expiration(expiredAt)
                .signWith(key)
                .compact();
    }
}
