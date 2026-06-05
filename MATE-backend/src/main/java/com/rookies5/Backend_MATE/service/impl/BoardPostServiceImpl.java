package com.rookies5.Backend_MATE.service.impl;

import com.rookies5.Backend_MATE.dto.request.BoardPostRequestDto;
import com.rookies5.Backend_MATE.dto.response.BoardPostResponseDto;
import com.rookies5.Backend_MATE.entity.BoardPost;
import com.rookies5.Backend_MATE.entity.Project;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.entity.enums.UserRole;
import com.rookies5.Backend_MATE.exception.*;

import com.rookies5.Backend_MATE.mapper.BoardPostMapper;
import com.rookies5.Backend_MATE.repository.*;
import com.rookies5.Backend_MATE.service.BoardPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BoardPostServiceImpl implements BoardPostService {

    private final BoardPostRepository boardPostRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final CommentRepository commentRepository;

    /**
     * 새로운 게시글 작성
     */
    @Override
    public BoardPostResponseDto createPost(Long userId, BoardPostRequestDto requestDto) {
        // 1. 프로젝트 존재 확인
        Project project = projectRepository.findById(requestDto.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.PROJECT_NOT_FOUND, requestDto.getProjectId()));

        // 2. [추가] 프로젝트 멤버 권한 검증 (중요!)
        validateProjectMember(project.getId(), userId);

        // 3. 유저 조회
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND, userId));

        BoardPost post = BoardPostMapper.mapToEntity(requestDto, project, author);
        BoardPost savedPost = boardPostRepository.save(post);

        return BoardPostMapper.mapToResponse(savedPost, userId);
    }

    /**
     * 특정 프로젝트의 게시글 페이징 조회
     */
    @Transactional(readOnly = true)
    @Override
    public Page<BoardPostResponseDto> getPostsByProjectId(Long projectId, Long userId, Pageable pageable) {
        // 1. 프로젝트 멤버인지 확인
        validateProjectMember(projectId, userId);

        // 2. 페이징 조회 진행
        return boardPostRepository.findAllByProjectId(projectId, pageable)
                .map(post -> BoardPostMapper.mapToResponse(post, userId));
    }

    /**
     * 게시글 부분 수정 (PATCH)
     */
    @Override
    public BoardPostResponseDto patchPost(Long postId, Long userId, BoardPostRequestDto requestDto) {
        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOARD_NOT_FOUND, postId));

        // [추가] 프로젝트 멤버인지 먼저 확인 (프로젝트에서 쫓겨난 유저 방지)
        validateProjectMember(post.getProject().getId(), userId);

        // 본인 확인
        if (!post.getAuthor().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.AUTH_ACCESS_DENIED);
        }

        post.updatePost(requestDto);
        return BoardPostMapper.mapToResponse(post, userId);
    }

    /**
     * 게시글 삭제
     */
    @Override
    public void deletePost(Long postId, Long userId) {
        // 1. 게시글 존재 확인
        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOARD_NOT_FOUND, postId));

        // 2. 프로젝트 멤버인지 먼저 확인 (외부인 차단)
        validateProjectMember(post.getProject().getId(), userId);

        // 3. 권한 검증 (작성자이거나 프로젝트 주인이어야 함)
        boolean isAuthor = post.getAuthor().getId().equals(userId);
        boolean isProjectOwner = post.getProject().getOwner().getId().equals(userId);

        if (!isAuthor && !isProjectOwner) {
            throw new BusinessException(ErrorCode.AUTH_ACCESS_DENIED, "삭제 권한이 없습니다.");
        }

        // 4. 해당 게시물의 댓글들도 함께 Soft Delete (중요!)
        commentRepository.softDeleteAllByPostId(postId);

        // 5. 게시글 본체 Soft Delete
        boardPostRepository.softDeleteById(postId);

    }

    /**
     * 게시글 상세 조회 (권한 검증 및 조회수 증가 로직 포함)
     */
    @Override
    public BoardPostResponseDto getPostDetail(Long projectId, Long postId, Long userId) {
        // 1. 게시글 존재 여부 확인
        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOARD_NOT_FOUND, postId));

        // 2. 해당 게시글이 요청한 프로젝트에 속하는지 검증
        if (!post.getProject().getId().equals(projectId)) {
            throw new InvalidRequestException(ErrorCode.VALIDATION_ERROR, "해당 프로젝트의 게시글이 아닙니다.");
        }

        // 3. 권한 검증: 해당 프로젝트의 팀원(MEMBER, OWNER)인지 확인
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
        if (!isMember) {
            throw new AccessDeniedException(ErrorCode.AUTH_ACCESS_DENIED, "프로젝트 팀원만 게시글을 조회할 수 있습니다.");
        }

        // 4. 조회수 증가 로직
        post.incrementViewCount();

        // 5. DTO 변환 후 반환 (기존 BoardPostMapper.mapToResponse 그대로 활용)
        return BoardPostMapper.mapToResponse(post, userId);
    }

    // --- 공통 검증 메서드 추출 ---
    private void validateProjectMember(Long projectId, Long userId) {
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
        if (!isMember) {
            throw new AccessDeniedException(ErrorCode.AUTH_ACCESS_DENIED, "해당 프로젝트의 멤버가 아닙니다.");
        }
    }
}