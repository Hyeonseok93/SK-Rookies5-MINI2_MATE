package com.rookies5.Backend_MATE.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.entity.enums.Position;
import com.rookies5.Backend_MATE.repository.RefreshTokenRepository;
import com.rookies5.Backend_MATE.repository.UserRepository;
import com.rookies5.Backend_MATE.security.RefreshTokenCookieManager;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthSessionSecurityTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void createUser() {
        userRepository.save(User.builder()
                .email("cookie-session@mate.com")
                .password(passwordEncoder.encode("password1"))
                .nickname("cookieuser")
                .phoneNumber("01090909090")
                .position(Position.BE)
                .build());
    }

    @Test
    @DisplayName("Refresh token stays in an HttpOnly SameSite cookie and rotates")
    void refreshCookieRotatesAndIsNotExposedInJson() throws Exception {
        MvcResult login = login();
        Cookie first = login.getResponse().getCookie(RefreshTokenCookieManager.COOKIE_NAME);
        String setCookie = login.getResponse().getHeader("Set-Cookie");

        assertThat(first).isNotNull();
        assertThat(first.isHttpOnly()).isTrue();
        assertThat(setCookie).contains("SameSite=Lax");
        assertThat(login.getResponse().getContentAsString()).doesNotContain("refreshToken");

        MvcResult refreshed = mockMvc.perform(post("/api/auth/refresh").cookie(first))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        Cookie rotated = refreshed.getResponse().getCookie(RefreshTokenCookieManager.COOKIE_NAME);
        assertThat(rotated).isNotNull();
        assertThat(rotated.getValue()).isNotEqualTo(first.getValue());
        assertThat(refreshed.getResponse().getContentAsString()).doesNotContain("refreshToken");
    }

    @Test
    @DisplayName("Reusing a rotated refresh token revokes the active token family")
    void reusedRefreshTokenRevokesFamily() throws Exception {
        Cookie first = login().getResponse().getCookie(RefreshTokenCookieManager.COOKIE_NAME);
        Cookie rotated = mockMvc.perform(post("/api/auth/refresh").cookie(first))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getCookie(RefreshTokenCookieManager.COOKIE_NAME);

        mockMvc.perform(post("/api/auth/refresh").cookie(first))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("AUTH_005"));

        mockMvc.perform(post("/api/auth/refresh").cookie(rotated))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("AUTH_005"));

        Long userId = userRepository.findByEmail("cookie-session@mate.com").orElseThrow().getId();
        assertThat(refreshTokenRepository.findAllByUserIdAndRevokedAtIsNull(userId)).isEmpty();
    }

    private MvcResult login() throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "cookie-session@mate.com",
                                "password", "password1"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
    }
}
