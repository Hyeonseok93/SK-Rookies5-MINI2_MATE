package com.rookies5.Backend_MATE.service;

import com.rookies5.Backend_MATE.entity.Project;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.entity.enums.Category;
import com.rookies5.Backend_MATE.entity.enums.OnOffline;
import com.rookies5.Backend_MATE.entity.enums.Position;
import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import com.rookies5.Backend_MATE.repository.ProjectRepository;
import com.rookies5.Backend_MATE.repository.UserRepository;
import com.rookies5.Backend_MATE.security.CustomUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ApplicationOwnerAccessTest {

    @Autowired
    private ApplicationService applicationService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Only project owner can list applicants")
    void ownerCanListApplications() {
        User owner = saveUser("owner@mate.com", "01011112222", "owner1");
        User stranger = saveUser("stranger@mate.com", "01033334444", "other1");
        Project project = saveProject(owner);

        authenticateAs(owner);
        assertThatCode(() -> applicationService.getApplicationsByProjectId(project.getId()))
                .doesNotThrowAnyException();

        authenticateAs(stranger);
        assertThatThrownBy(() -> applicationService.getApplicationsByProjectId(project.getId()))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getErrorCode())
                .isEqualTo(ErrorCode.AUTH_ACCESS_DENIED);
    }

    private User saveUser(String email, String phone, String nickname) {
        return userRepository.save(User.builder()
                .email(email)
                .password("encoded")
                .nickname(nickname)
                .phoneNumber(phone)
                .position(Position.BE)
                .build());
    }

    private Project saveProject(User owner) {
        return projectRepository.save(Project.builder()
                .owner(owner)
                .category(Category.PROJECT)
                .title("IDOR test project")
                .content("content here")
                .recruitCount(3)
                .onOffline(OnOffline.ONLINE)
                .endDate(LocalDate.now().plusDays(7))
                .build());
    }

    private void authenticateAs(User user) {
        CustomUserDetails details = new CustomUserDetails(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities())
        );
    }
}