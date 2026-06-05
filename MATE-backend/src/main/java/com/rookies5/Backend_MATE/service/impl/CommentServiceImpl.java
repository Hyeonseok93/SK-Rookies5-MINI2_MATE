package com.rookies5.Backend_MATE.service.impl;

import com.rookies5.Backend_MATE.dto.request.CommentRequestDto;
import com.rookies5.Backend_MATE.dto.response.CommentResponseDto;
import com.rookies5.Backend_MATE.entity.BoardPost;
import com.rookies5.Backend_MATE.entity.Comment;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.EntityNotFoundException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import com.rookies5.Backend_MATE.mapper.CommentMapper;
import com.rookies5.Backend_MATE.repository.BoardPostRepository;
import com.rookies5.Backend_MATE.repository.CommentRepository;
import com.rookies5.Backend_MATE.repository.ProjectMemberRepository;
import com.rookies5.Backend_MATE.repository.UserRepository;
import com.rookies5.Backend_MATE.security.SecurityUtils;
import com.rookies5.Backend_MATE.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final BoardPostRepository boardPostRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    /**
     * 1. 댓글 작성
     */
    @Override
    public CommentResponseDto createComment(Long postId, Long userId, CommentRequestDto requestDto) {
        // 게시글 존재 여부 확인
        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOARD_NOT_FOUND, postId));

        // [추가] 해당 프로젝트의 멤버인지 검증 (게시글이 속한 프로젝트 ID 기준)
        validateProjectMember(post.getProject().getId(), userId);

        // 작성자 존재 여부 확인
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND, userId));

        // DTO -> Entity 변환 (이제 postId, authorId가 없는 DTO를 사용하므로 인자로 전달)
        Comment comment = CommentMapper.mapToEntity(requestDto, post, author);

        // DB 저장
        Comment savedComment = commentRepository.save(comment);

        return CommentMapper.mapToResponse(savedComment);
    }

    /**
     * 2. 특정 게시글의 모든 댓글 조회 (멤버만 가능하도록 수정)
     */
    @Transactional(readOnly = true)
    @Override
    public List<CommentResponseDto> getCommentsByPostId(Long postId, Long userId) {
        // 게시글 존재 여부 및 프로젝트 멤버 검증
        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOARD_NOT_FOUND, postId));

        validateProjectMember(post.getProject().getId(), userId);

        return commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(CommentMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 3. 댓글 수정
     */
    @Override
    public CommentResponseDto updateComment(Long commentId, Long userId, CommentRequestDto requestDto) {
        // 1. 댓글 존재 여부 확인
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.COMMENT_NOT_FOUND, commentId));

        // 2. 권한 검증: 파라미터로 넘어온 userId와 댓글 작성자 ID 비교
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.AUTH_ACCESS_DENIED, "댓글 수정 권한이 없습니다.");
        }

        // 3. Dirty Checking: 댓글 내용 업데이트
        comment.updateComment(requestDto.getContent());

        return CommentMapper.mapToResponse(comment);
    }

    @Override
    public void deleteComment(Long commentId, Long userId) {
        // 1. 댓글 존재 여부 확인
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.COMMENT_NOT_FOUND, commentId));

        // 2. 권한 검증: 댓글 작성자 본인이거나 해당 프로젝트의 방장인 경우
        boolean isAuthor = comment.getAuthor().getId().equals(userId);
        boolean isProjectOwner = comment.getPost().getProject().getOwner().getId().equals(userId);

        if (!isAuthor && !isProjectOwner) {
            throw new BusinessException(ErrorCode.AUTH_ACCESS_DENIED, "댓글 삭제 권한이 없습니다.");
        }

        // 3. Soft Delete 수행
        commentRepository.softDeleteById(commentId);
    }

    // --- 공통 검증 메서드 ---
    private void validateProjectMember(Long projectId, Long userId) {
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }
    }
}