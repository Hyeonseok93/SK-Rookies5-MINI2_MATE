package com.rookies5.Backend_MATE.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardPostRequestDto {
    private Long projectId;

    private Long authorId;

    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 100, message = "제목은 100자 이내여야 합니다")
    @Pattern(regexp = "^[^<>]*$", message = "제목에는 HTML 태그를 사용할 수 없습니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다.")
    @Size(max = 10000, message = "내용은 10,000자 이내여야 합니다")
    @Pattern(regexp = "^[^<>]*$", message = "내용에는 HTML 태그를 사용할 수 없습니다")
    private String content;

    private String type;
}