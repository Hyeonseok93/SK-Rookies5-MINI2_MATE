package com.rookies5.Backend_MATE.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rookies5.Backend_MATE.controller.AuthController;
import com.rookies5.Backend_MATE.entity.RefreshToken;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.entity.enums.Position;
import com.rookies5.Backend_MATE.repository.RefreshTokenRepository;
import com.rookies5.Backend_MATE.repository.UserRepository;
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

/**
 * Phase 1 privacy regressions for self-service recovery endpoints.
 * Until a verified delivery channel exists, both endpoints must return a
 * uniform success shape with no lookup side effects / credential mutation.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthPrivacyTest {

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

    @Test
    @DisplayName("Find-email returns a uniform privacy-safe response (no masked email)")
    void findEmailReturnsUniformPrivacySafeResponse() throws Exception {
        userRepository.save(User.builder()
                .email("abcdef@example.com")
                .password(passwordEncoder.encode("password1"))
                .nickname("maskuser")
                .phoneNumber("01055556666")
                .position(Position.FE)
                .build());

        mockMvc.perform(post("/api/auth/find-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phoneNumber", "01055556666"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("OK"))
                .andExpect(jsonPath("$.message").value(AuthController.SELF_SERVICE_RECOVERY_UNAVAILABLE));
    }

    @Test
    @DisplayName("Find-email found and not-found responses are equivalent")
    void findEmailFoundAndNotFoundAreEquivalent() throws Exception {
        userRepository.save(User.builder()
                .email("found@example.com")
                .password(passwordEncoder.encode("password1"))
                .nickname("founduser")
                .phoneNumber("01011112222")
                .position(Position.FE)
                .build());

        MvcResult found = mockMvc.perform(post("/api/auth/find-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phoneNumber", "01011112222"))))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult missing = mockMvc.perform(post("/api/auth/find-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phoneNumber", "01000000000"))))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(found.getResponse().getContentAsString())
                .isEqualTo(missing.getResponse().getContentAsString());
        assertThat(found.getResponse().getContentAsString()).doesNotContain("found@");
        assertThat(found.getResponse().getContentAsString()).doesNotContain("***@");
    }

    @Test
    @DisplayName("Password reset does not mutate password or revoke refresh tokens")
    void resetPasswordDoesNotMutatePasswordOrTokens() throws Exception {
        String oldHash = passwordEncoder.encode("oldpassword");
        User user = userRepository.save(User.builder()
                .email("reset@example.com")
                .password(oldHash)
                .nickname("resetuser")
                .phoneNumber("01077778888")
                .position(Position.BE)
                .build());
        refreshTokenRepository.save(new RefreshToken(user.getId(), "old-refresh-token"));

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "reset@example.com", "phoneNumber", "01077778888"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("OK"))
                .andExpect(jsonPath("$.message").value(AuthController.SELF_SERVICE_RECOVERY_UNAVAILABLE));

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getPassword()).isEqualTo(oldHash);
        assertThat(refreshTokenRepository.findByUserId(user.getId())).isPresent();
        assertThat(refreshTokenRepository.findByUserId(user.getId()).get().getTokenValue())
                .isEqualTo("old-refresh-token");
    }

    @Test
    @DisplayName("Password reset found and not-found responses are equivalent")
    void resetPasswordFoundAndNotFoundAreEquivalent() throws Exception {
        userRepository.save(User.builder()
                .email("exists-reset@example.com")
                .password(passwordEncoder.encode("password1"))
                .nickname("exreset")
                .phoneNumber("01033334444")
                .position(Position.BE)
                .build());

        MvcResult found = mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "exists-reset@example.com", "phoneNumber", "01033334444"))))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult missing = mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "missing@example.com", "phoneNumber", "01000000000"))))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(found.getResponse().getContentAsString())
                .isEqualTo(missing.getResponse().getContentAsString());
    }
}
