package com.rookies5.Backend_MATE.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.entity.enums.Position;
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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;

/**
 * Phase 4 web-security regressions (CSRF + recovery endpoint privacy shape).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class WebSecurityRegressionTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Password reset returns uniform interim response with no credential mutation")
    void resetPasswordResponseIsUniformAndNonMutating() throws Exception {
        String oldHash = passwordEncoder.encode("KeepThisSecret1");
        User user = userRepository.save(User.builder()
                .email("reset-web@mate.com")
                .password(oldHash)
                .nickname("resetweb")
                .phoneNumber("01099990000")
                .position(Position.BE)
                .build());

        String body = objectMapper.writeValueAsString(
                Map.of("email", "reset-web@mate.com", "phoneNumber", "01099990000"));

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("OK"))
                .andExpect(jsonPath("$.message").value(AuthController.SELF_SERVICE_RECOVERY_UNAVAILABLE))
                .andExpect(content().string(not(containsString("\"password\""))))
                .andExpect(content().string(not(containsString("tempPassword"))))
                .andExpect(content().string(not(containsString("temporary"))));

        assertThat(userRepository.findById(user.getId()).orElseThrow().getPassword()).isEqualTo(oldHash);
    }

    @Test
    @DisplayName("Find-email and reset-password not-found responses match success responses")
    void recoveryEndpointsNotFoundMatchSuccess() throws Exception {
        userRepository.save(User.builder()
                .email("present@mate.com")
                .password(passwordEncoder.encode("password1"))
                .nickname("present")
                .phoneNumber("01012121212")
                .position(Position.FE)
                .build());

        MvcResult findFound = mockMvc.perform(post("/api/auth/find-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phoneNumber", "01012121212"))))
                .andExpect(status().isOk())
                .andReturn();
        MvcResult findMissing = mockMvc.perform(post("/api/auth/find-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phoneNumber", "01000000001"))))
                .andExpect(status().isOk())
                .andReturn();
        assertThat(findFound.getResponse().getContentAsString())
                .isEqualTo(findMissing.getResponse().getContentAsString());

        MvcResult resetFound = mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "present@mate.com", "phoneNumber", "01012121212"))))
                .andExpect(status().isOk())
                .andReturn();
        MvcResult resetMissing = mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "absent@mate.com", "phoneNumber", "01000000001"))))
                .andExpect(status().isOk())
                .andReturn();
        assertThat(resetFound.getResponse().getContentAsString())
                .isEqualTo(resetMissing.getResponse().getContentAsString());
    }

    @Test
    @DisplayName("Admin state-changing POST is rejected without a CSRF token")
    void adminLogoutWithoutCsrfIsForbidden() throws Exception {
        mockMvc.perform(post("/admin/logout")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin state-changing POST succeeds once a valid CSRF token is supplied")
    void adminLogoutWithCsrfIsAccepted() throws Exception {
        mockMvc.perform(post("/admin/logout")
                        .with(user("admin").roles("ADMIN"))
                        .with(csrf()))
                .andExpect(status().is3xxRedirection());
    }
}