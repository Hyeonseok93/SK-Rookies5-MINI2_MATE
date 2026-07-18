package com.rookies5.Backend_MATE.repository;

import com.rookies5.Backend_MATE.entity.*;
import com.rookies5.Backend_MATE.entity.enums.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MappingTest {

    @Autowired UserRepository userRepository;
    @Autowired ProjectRepository projectRepository;
    @Autowired ApplicationRepository applicationRepository;
    @Autowired ProjectMemberRepository projectMemberRepository;
    @Autowired BoardPostRepository boardPostRepository;
    @Autowired CommentRepository commentRepository;
    @Autowired EntityManager em;

    @Test
    @DisplayName("User-Project mapping and defaults")
    void userProjectMappingTest() {
        User user = User.builder()
                .email("test@mate.com")
                .password("1234")
                .nickname("devking")
                .phoneNumber("01012345678")
                .position(Position.BE)
                .build();
        userRepository.save(user);

        Project project = Project.builder()
                .owner(user)
                .category(Category.PROJECT)
                .title("Spring Boot study")
                .content("looking for members")
                .recruitCount(4)
                .onOffline(OnOffline.ONLINE)
                .endDate(LocalDate.now().plusDays(10))
                .build();
        projectRepository.save(project);

        em.flush();
        em.clear();

        Project savedProject = projectRepository.findById(project.getId()).orElseThrow();

        assertThat(savedProject.getOwner().getNickname()).isEqualTo("devking");
        assertThat(savedProject.getCurrentCount()).isEqualTo(0);
        assertThat(savedProject.getStatus()).isEqualTo(ProjectStatus.RECRUITING);
    }

    @Test
    @DisplayName("Other entities mapping and defaults")
    void otherEntitiesMappingTest() {
        User user = User.builder()
                .email("test2@mate.com")
                .password("1234")
                .nickname("applicant")
                .phoneNumber("01099998888")
                .position(Position.FE)
                .build();
        userRepository.save(user);

        Project project = Project.builder()
                .owner(user)
                .category(Category.STUDY)
                .title("React study")
                .content("content")
                .recruitCount(3)
                .onOffline(OnOffline.ONLINE)
                .endDate(LocalDate.now().plusDays(5))
                .build();
        projectRepository.save(project);

        Application app = Application.builder()
                .project(project)
                .applicant(user)
                .message("I will work hard!")
                .position(Position.FE)
                .build();
        applicationRepository.save(app);

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(MemberRole.MEMBER)
                .position(Position.FE)
                .build();
        projectMemberRepository.save(member);

        BoardPost post = BoardPost.builder()
                .project(project)
                .author(user)
                .title("Hello")
                .content("Hi there!")
                .build();
        boardPostRepository.save(post);

        Comment comment = Comment.builder()
                .post(post)
                .author(user)
                .content("Welcome!")
                .build();
        commentRepository.save(comment);

        em.flush();
        em.clear();

        Application savedApp = applicationRepository.findById(app.getId()).orElseThrow();
        BoardPost savedPost = boardPostRepository.findById(post.getId()).orElseThrow();
        Comment savedComment = commentRepository.findById(comment.getId()).orElseThrow();

        assertThat(savedApp.getStatus()).isEqualTo(ApplicationStatus.PENDING);
        assertThat(savedApp.getPosition()).isEqualTo(Position.FE);
        assertThat(savedPost.getViewCount()).isEqualTo(0);
        assertThat(savedComment.getPost().getTitle()).isEqualTo("Hello");
    }
}