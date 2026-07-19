package com.rookies5.Backend_MATE.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequestDto {
    private Long postId;

    private Long authorId;

    @NotBlank(message = "댓글 내용은 필수 입력 항목입니다.")
    @Size(min = 1, max = 500, message = "댓글은 1~500자 이내여야 합니다")
    @Pattern(regexp = "^[^<>]*$", message = "댓글에는 HTML 태그를 사용할 수 없습니다")
    private String content;
}