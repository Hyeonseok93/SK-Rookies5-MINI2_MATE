package com.rookies5.Backend_MATE.mapper;

import com.rookies5.Backend_MATE.dto.request.BoardPostRequestDto;
import com.rookies5.Backend_MATE.dto.response.BoardPostResponseDto;
import com.rookies5.Backend_MATE.entity.BoardPost;
import com.rookies5.Backend_MATE.entity.Project;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.entity.enums.BoardPostType;

import java.util.Objects;

public class BoardPostMapper {

    /**
     * Entity -> Response DTO 변환
     * 게시글 상세 조회 및 목록 출력 시 사용하며, 작성자의 닉네임을 포함합니다.
     */
    public static BoardPostResponseDto mapToResponse(BoardPost post, Long currentUserId) {

        boolean isAuthor = Objects.equals(post.getAuthor().getId(), currentUserId);

        // 💡 post.getType()이 null이면 "GENERAL"을 기본값으로 사용하도록 수정!
        String typeString = (post.getType() == null) ? "GENERAL" : post.getType().name();

        return BoardPostResponseDto.builder()
                .id(post.getId())
                .projectId(post.getProject().getId())
                .authorId(post.getAuthor().getId())
                .authorNickname(post.getAuthor().getNickname()) // 작성자 닉네임 매핑
                // ★ 작성자의 최신 프로필 이미지 매핑 추가
                .authorProfileImg(post.getAuthor() != null ? post.getAuthor().getProfileImg() : null)
                .title(post.getTitle())
                .content(post.getContent())
                .type(typeString)
                .isAuthor(isAuthor)
                .viewCount(post.getViewCount())
                .createdAt(post.getCreatedAt()) // 생성 시간 추가
                .build();
    }

    /**
     * Request DTO -> Entity 변환
     * 새로운 게시글을 등록할 때 사용하며, 초기 조회수는 0으로 설정합니다.
     */
    public static BoardPost mapToEntity(BoardPostRequestDto requestDto, Project project, User author) {
        // 프론트에서 보낸 String "NOTICE" 등을 Enum BoardPostType.NOTICE로 변환
        BoardPostType typeEnum = (requestDto.getType() == null) ? BoardPostType.GENERAL
                : BoardPostType.valueOf(requestDto.getType());

        return BoardPost.builder()
                .project(project)
                .author(author)
                .title(requestDto.getTitle())
                .type(typeEnum)
                .content(requestDto.getContent())
                .viewCount(0) // 초기 조회수 0으로 고정
                .build();
    }
}