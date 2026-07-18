package com.rookies5.Backend_MATE.service;

import com.rookies5.Backend_MATE.dto.response.ProjectResponseDto;
import com.rookies5.Backend_MATE.entity.Application;
import com.rookies5.Backend_MATE.entity.BoardPost;
import com.rookies5.Backend_MATE.entity.Comment;
import com.rookies5.Backend_MATE.entity.Project;
import com.rookies5.Backend_MATE.entity.ProjectMember;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.entity.enums.Category;
import com.rookies5.Backend_MATE.entity.enums.MemberRole;
import com.rookies5.Backend_MATE.entity.enums.OnOffline;
import com.rookies5.Backend_MATE.entity.enums.Position;
import com.rookies5.Backend_MATE.repository.ApplicationRepository;
import com.rookies5.Backend_MATE.repository.BoardPostRepository;
import com.rookies5.Backend_MATE.repository.CommentRepository;
import com.rookies5.Backend_MATE.repository.ProjectMemberRepository;
import com.rookies5.Backend_MATE.repository.ProjectRepository;
import com.rookies5.Backend_MATE.repository.UserRepository;
import com.rookies5.Backend_MATE.security.CustomUserDetails;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class Phase2LifecycleTest {

    @Autowired ApplicationService applicationService;
    @Autowired ProjectService projectService;
    @Autowired DomainDeletionService deletionService;
    @Autowired UserRepository userRepository;
    @Autowired ProjectRepository projectRepository;
    @Autowired ProjectMemberRepository memberRepository;
    @Autowired ApplicationRepository applicationRepository;
    @Autowired BoardPostRepository postRepository;
    @Autowired CommentRepository commentRepository;
    @Autowired EntityManager entityManager;

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void acceptingApplicationRevivesSoftDeletedUniqueMember() {
        User owner = saveUser("revive-owner@mate.com", "01010000001", "reviveown");
        User applicant = saveUser("revive-user@mate.com", "01010000002", "reviveusr");
        Project project = saveProject(owner, 1);
        ProjectMember deletedMember = memberRepository.save(ProjectMember.builder()
                .project(project).user(applicant).role(MemberRole.MEMBER).position(Position.FE).build());
        deletedMember.softDelete();
        Application application = applicationRepository.save(Application.builder()
                .project(project).applicant(applicant).message("I would like to join this project.")
                .position(Position.BE).build());
        entityManager.flush();
        entityManager.clear();
        authenticate(owner);

        applicationService.acceptApplication(application.getId());
        entityManager.flush();
        entityManager.clear();

        ProjectMember revived = memberRepository.findByProjectIdAndUserId(project.getId(), applicant.getId())
                .orElseThrow();
        assertThat(revived.getId()).isEqualTo(deletedMember.getId());
        assertThat(revived.getPosition()).isEqualTo(Position.BE);
        assertThat(memberRepository.findByProjectIdAndUserIdIncludingDeleted(project.getId(), applicant.getId()))
                .isPresent();
    }

    @Test
    void userDeleteAndRestoreRestoresOnlySameCascadeRows() {
        User owner = saveUser("cascade-owner@mate.com", "01020000001", "cascadeown");
        User member = saveUser("cascade-user@mate.com", "01020000002", "cascadeusr");
        Project project = saveProject(owner, 2);
        memberRepository.save(ProjectMember.builder()
                .project(project).user(owner).role(MemberRole.OWNER).position(Position.BE).build());
        memberRepository.save(ProjectMember.builder()
                .project(project).user(member).role(MemberRole.MEMBER).position(Position.FE).build());
        Application application = applicationRepository.save(Application.builder()
                .project(project).applicant(member).message("I would like to join this project.")
                .position(Position.FE).build());
        BoardPost post = postRepository.save(BoardPost.builder()
                .project(project).author(owner).title("Cascade post").content("body").build());
        Comment independentComment = commentRepository.save(Comment.builder()
                .post(post).author(owner).content("independent deletion").build());
        independentComment.softDelete();
        entityManager.flush();
        entityManager.clear();

        deletionService.deleteUser(owner.getId());
        assertThat(projectRepository.findById(project.getId())).isEmpty();
        assertThat(applicationRepository.findById(application.getId())).isEmpty();

        deletionService.restoreUser(owner.getId());
        entityManager.flush();
        entityManager.clear();

        Project restored = projectRepository.findById(project.getId()).orElseThrow();
        assertThat(restored.getCurrentCount()).isEqualTo(2);
        assertThat(applicationRepository.findById(application.getId())).isPresent();
        assertThat(postRepository.findById(post.getId())).isPresent();
        // It predates the cascade timestamp, so provenance is ambiguous and it stays deleted.
        assertThat(commentRepository.findById(independentComment.getId())).isEmpty();
    }

    @Test
    void projectDetailMapsAuthenticatedOwnerAndMemberRoles() {
        User owner = saveUser("detail-owner@mate.com", "01030000001", "detailown");
        User member = saveUser("detail-user@mate.com", "01030000002", "detailusr");
        Project project = saveProject(owner, 2);
        memberRepository.save(ProjectMember.builder()
                .project(project).user(owner).role(MemberRole.OWNER).position(Position.BE).build());
        memberRepository.save(ProjectMember.builder()
                .project(project).user(member).role(MemberRole.MEMBER).position(Position.FE).build());

        ProjectResponseDto ownerView = projectService.getProjectById(project.getId(), owner.getId());
        ProjectResponseDto memberView = projectService.getProjectById(project.getId(), member.getId());
        ProjectResponseDto anonymousView = projectService.getProjectById(project.getId(), null);

        assertThat(ownerView.isOwner()).isTrue();
        assertThat(ownerView.getRole()).isEqualTo("OWNER");
        assertThat(memberView.isOwner()).isFalse();
        assertThat(memberView.getRole()).isEqualTo("MEMBER");
        assertThat(anonymousView.getRole()).isNull();
    }

    @Test
    void reopenWithoutBodyRepairsExpiredDateAndFullCapacity() {
        User owner = saveUser("reopen-owner@mate.com", "01040000001", "reopenown");
        Project project = projectRepository.save(Project.builder()
                .owner(owner).category(Category.PROJECT).title("Expired closed project")
                .content("Expired project reopen regression").recruitCount(2).currentCount(2)
                .onOffline(OnOffline.ONLINE).status(com.rookies5.Backend_MATE.entity.enums.ProjectStatus.CLOSED)
                .endDate(LocalDate.now().minusDays(1)).build());

        ProjectResponseDto reopened = projectService.reopenProject(project.getId(), owner.getId(), null);

        assertThat(reopened.getRecruitCount()).isGreaterThan(reopened.getCurrentCount());
        assertThat(reopened.getEndDate()).isAfterOrEqualTo(LocalDate.now());
        assertThat(reopened.getStatus().name()).isEqualTo("RECRUITING");
    }

    private User saveUser(String email, String phone, String nickname) {
        return userRepository.save(User.builder()
                .email(email).password("encoded").nickname(nickname)
                .phoneNumber(phone).position(Position.BE).build());
    }

    private Project saveProject(User owner, int currentCount) {
        return projectRepository.save(Project.builder()
                .owner(owner).category(Category.PROJECT).title("Phase two project")
                .content("Project lifecycle test content").recruitCount(4)
                .currentCount(currentCount).onOffline(OnOffline.ONLINE)
                .endDate(LocalDate.now().plusDays(7)).build());
    }

    private void authenticate(User user) {
        CustomUserDetails details = new CustomUserDetails(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities()));
    }
}
