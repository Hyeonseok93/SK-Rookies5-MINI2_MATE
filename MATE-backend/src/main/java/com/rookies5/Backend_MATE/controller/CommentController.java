package com.rookies5.Backend_MATE.controller;

import com.rookies5.Backend_MATE.common.SuccessResponse;
import com.rookies5.Backend_MATE.security.CustomUserDetails;
import com.rookies5.Backend_MATE.dto.request.CommentRequestDto;
import com.rookies5.Backend_MATE.dto.response.CommentResponseDto;
import com.rookies5.Backend_MATE.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/posts") // 기본 경로는 그대로 유지
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * 1. 댓글 작성
     * 프론트엔드 요청 규격에 맞춰 /{projectId}/board/{postId}/comments 로 수정
     */
    @PostMapping("/{projectId}/board/{postId}/comments")
    public SuccessResponse<CommentResponseDto> createComment(
            @PathVariable Long projectId, // 프론트에서 넘어오는 projectId 받기
            @PathVariable Long postId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CommentRequestDto requestDto) {

        log.info("댓글 작성 요청 - projectId: {}, postId: {}, userId: {}", projectId, postId, userDetails.getId());

        // 서비스에는 기존처럼 postId, userId, DTO 전달
        CommentResponseDto responseDto = commentService.createComment(postId, userDetails.getId(), requestDto);

        return new SuccessResponse<>("댓글이 성공적으로 작성되었습니다.", responseDto);
    }

    /**
     * 2. 특정 게시글의 모든 댓글 조회
     * 프론트엔드 요청 규격에 맞춰 /{projectId}/board/{postId}/comments 로 수정
     */
    @GetMapping("/{projectId}/board/{postId}/comments")
    public SuccessResponse<List<CommentResponseDto>> getCommentsByPostId(
            @PathVariable Long projectId, // 프론트에서 넘어오는 projectId 받기
            @PathVariable Long postId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("게시글 댓글 목록 조회 요청 - projectId: {}, postId: {}, userId: {}", projectId, postId, userDetails.getId());

        // 멤버 검증을 위해 userId도 함께 전달
        List<CommentResponseDto> responseDtoList = commentService.getCommentsByPostId(postId, userDetails.getId());

        return new SuccessResponse<>("댓글 목록 조회가 완료되었습니다.", responseDtoList);
    }

    /**
     * 3. 댓글 수정
     */
    @PutMapping("/comments/{commentId}")
    public SuccessResponse<CommentResponseDto> updateComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CommentRequestDto requestDto) {

        log.info("댓글 수정 요청 - commentId: {}, userId: {}", commentId, userDetails.getId());

        CommentResponseDto responseDto = commentService.updateComment(commentId, userDetails.getId(), requestDto);

        return new SuccessResponse<>("댓글이 성공적으로 수정되었습니다.", responseDto);
    }

    /**
     * 4. 댓글 삭제
     */
    @DeleteMapping("/comments/{commentId}")
    public SuccessResponse<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("댓글 삭제 요청 - commentId: {}, userId: {}", commentId, userDetails.getId());

        commentService.deleteComment(commentId, userDetails.getId());

        return new SuccessResponse<>("댓글이 성공적으로 삭제되었습니다.");
    }
}