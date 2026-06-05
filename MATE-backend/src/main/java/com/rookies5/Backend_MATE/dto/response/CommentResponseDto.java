package com.rookies5.Backend_MATE.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class CommentResponseDto {
    private Long id;
    private Long postId;
    private Long authorId;

    private String authorNickname;
    private String authorProfileImg;
    
    private String content;
    private LocalDateTime createdAt;
}