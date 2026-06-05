package com.rookies5.Backend_MATE.mapper;

import com.rookies5.Backend_MATE.dto.request.CommentRequestDto;
import com.rookies5.Backend_MATE.dto.response.CommentResponseDto;
import com.rookies5.Backend_MATE.entity.BoardPost;
import com.rookies5.Backend_MATE.entity.Comment;
import com.rookies5.Backend_MATE.entity.User;

public class CommentMapper {

    /**
     * Entity -> Response DTO 변환
     * 댓글 목록 조회 시 작성자의 닉네임을 포함하여 반환합니다.
     */
    public static CommentResponseDto mapToResponse(Comment comment) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .authorId(comment.getAuthor().getId())
                .authorNickname(comment.getAuthor().getNickname()) // 작성자 닉네임 매핑
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .authorProfileImg(comment.getAuthor().getProfileImg())
                .build();
    }

    /**
     * Request DTO -> Entity 변환
     * 댓글 작성 시 입력받은 데이터와 연관된 게시글, 작성자 엔티티를 조합합니다.
     */
    public static Comment mapToEntity(CommentRequestDto requestDto, BoardPost post, User author) {
        return Comment.builder()
                .post(post)
                .author(author)
                .content(requestDto.getContent())
                .build();
    }
}