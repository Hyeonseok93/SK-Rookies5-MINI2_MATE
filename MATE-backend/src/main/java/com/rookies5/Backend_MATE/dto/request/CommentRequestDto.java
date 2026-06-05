package com.rookies5.Backend_MATE.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequestDto {
    private Long postId;

    private Long authorId;

    @NotBlank(message = "댓글 내용은 필수 입력 항목입니다.")
    private String content;
}