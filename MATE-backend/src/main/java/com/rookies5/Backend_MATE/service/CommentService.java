package com.rookies5.Backend_MATE.service;

import com.rookies5.Backend_MATE.dto.request.CommentRequestDto;
import com.rookies5.Backend_MATE.dto.response.CommentResponseDto;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentService {

    // 1. 댓글 작성 (postId와 userId 추가)
    CommentResponseDto createComment(Long postId, Long userId, CommentRequestDto requestDto);

    // 2. 특정 게시글의 모든 댓글 조회 (userId 추가)
    List<CommentResponseDto> getCommentsByPostId(Long postId, Long userId);

    // 3. 댓글 수정 (userId 추가)
    CommentResponseDto updateComment(Long commentId, Long userId, CommentRequestDto requestDto);

    // 4. 댓글 삭제 (userId 추가)
    void deleteComment(Long commentId, Long userId);

}