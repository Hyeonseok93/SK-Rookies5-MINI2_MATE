package com.rookies5.Backend_MATE.service.impl;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rookies5.Backend_MATE.controller.AuthController;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.entity.enums.Position;
import com.rookies5.Backend_MATE.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phase 4: password-reset request logging must not leak email, phone, or secrets.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PasswordResetLogPrivacyTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private ListAppender<ILoggingEvent> appender;
    private Logger controllerLogger;

    @BeforeEach
    void attachAppender() {
        controllerLogger = (Logger) LoggerFactory.getLogger(AuthController.class);
        appender = new ListAppender<>();
        appender.start();
        controllerLogger.addAppender(appender);
    }

    @AfterEach
    void detachAppender() {
        controllerLogger.detachAppender(appender);
    }

    @Test
    @DisplayName("Password reset logs never leak the email, phone, or old password")
    void resetPasswordDoesNotLogSensitiveData() throws Exception {
        String email = "log-privacy@mate.com";
        String phone = "01088887777";
        String oldPlaintext = "OldSecret123";
        userRepository.save(User.builder()
                .email(email)
                .password(passwordEncoder.encode(oldPlaintext))
                .nickname("logpriv")
                .phoneNumber(phone)
                .position(Position.BE)
                .build());

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", email, "phoneNumber", phone))))
                .andExpect(status().isOk());

        assertThat(appender.list).isNotEmpty();
        for (ILoggingEvent event : appender.list) {
            String message = event.getFormattedMessage();
            assertThat(message).doesNotContain(email);
            assertThat(message).doesNotContain(phone);
            assertThat(message).doesNotContain(oldPlaintext);
        }
    }
}