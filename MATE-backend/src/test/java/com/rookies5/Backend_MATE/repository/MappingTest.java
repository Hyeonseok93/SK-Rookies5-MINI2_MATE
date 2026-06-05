package com.rookies5.Backend_MATE.repository;

import com.rookies5.Backend_MATE.entity.*;
import com.rookies5.Backend_MATE.entity.enums.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class MappingTest {

    // 모든 Repository 조종기들을 주입받음
    @Autowired UserRepository userRepository;
    @Autowired ProjectRepository projectRepository;
    @Autowired ApplicationRepository applicationRepository;
    @Autowired ProjectMemberRepository projectMemberRepository;
    @Autowired BoardPostRepository boardPostRepository;
    @Autowired CommentRepository commentRepository;
    @Autowired EntityManager em;

    @Test
    @DisplayName("User와 Project의 1:N 연관관계 매핑 및 기본값 테스트")
    void userProjectMappingTest() {
        // 1. User 생성
        User user = User.builder()
                .email("test@mate.com")
                .password("1234")
                .nickname("개발왕")
                .phoneNumber("010-1234-5678")
                .position(Position.BE)
                .build();
        userRepository.save(user);

        // 2. Project 생성 (currentCount는 입력하지 않음 -> Default 0 기대)
        Project project = Project.builder()
                .owner(user)
                .category(Category.PROJECT)
                .title("스프링부트 스터디원 구함")
                .content("열심히 할 사람 모집")
                .recruitCount(4)
                .onOffline(OnOffline.ONLINE)
                // status 값도 입력하지 않음 -> Default RECRUITING 기대
                .endDate(LocalDate.now().plusDays(10))
                .build();
        projectRepository.save(project);

        em.flush();
        em.clear();

        Project savedProject = projectRepository.findById(project.getId()).orElseThrow();

        // 검증 1: 연관관계 검증
        assertThat(savedProject.getOwner().getNickname()).isEqualTo("개발왕");
        // 검증 2: Builder.Default 초기값 검증 (현재 인원 0, 상태 RECRUITING)
        assertThat(savedProject.getCurrentCount()).isEqualTo(0);
        assertThat(savedProject.getStatus()).isEqualTo(ProjectStatus.RECRUITING);
    }

    @Test
    @DisplayName("나머지 Entity들의 연관관계 및 Builder.Default 초기값 매핑 테스트")
    void otherEntitiesMappingTest() {
        // 1. 공통 User, Project 세팅
        User user = User.builder()
                .email("test2@mate.com")
                .password("1234")
                .nickname("지원자")
                .phoneNumber("010-9999-8888")
                .position(Position.FE)
                .build();
        userRepository.save(user);

        Project project = Project.builder()
                .owner(user)
                .category(Category.STUDY)
                .title("리액트 스터디")
                .content("내용")
                .recruitCount(3)
                .onOffline(OnOffline.ONLINE)
                .endDate(LocalDate.now().plusDays(5))
                .build();
        projectRepository.save(project);

        // 2. Application 생성 (status 입력 안 함 -> Default PENDING 기대)
        Application app = Application.builder()
                .project(project)
                .applicant(user)
                .message("열심히 하겠습니다!")
                .build();
        applicationRepository.save(app);

        // 3. ProjectMember 생성
        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(MemberRole.MEMBER)
                .build();
        projectMemberRepository.save(member);

        // 4. BoardPost 생성 (viewCount 입력 안 함 -> Default 0 기대)
        BoardPost post = BoardPost.builder()
                .project(project)
                .author(user)
                .title("가입 인사")
                .content("안녕하세요!")
                .build();
        boardPostRepository.save(post);

        // 5. Comment 생성
        Comment comment = Comment.builder()
                .post(post)
                .author(user)
                .content("환영합니다!")
                .build();
        commentRepository.save(comment);

        // 강제 동기화 (DB 쿼리 전송)
        em.flush();
        em.clear();

        // 6. DB에서 다시 꺼내와서 검증
        Application savedApp = applicationRepository.findById(app.getId()).orElseThrow();
        BoardPost savedPost = boardPostRepository.findById(post.getId()).orElseThrow();
        Comment savedComment = commentRepository.findById(comment.getId()).orElseThrow();

        // 연관관계 및 기본값(Default) 검증
        assertThat(savedApp.getStatus()).isEqualTo(ApplicationStatus.PENDING); // 대기 상태 확인
        assertThat(savedPost.getViewCount()).isEqualTo(0); // 조회수 0 확인
        assertThat(savedComment.getPost().getTitle()).isEqualTo("가입 인사"); // 댓글과 게시글 매핑 확인
    }
}