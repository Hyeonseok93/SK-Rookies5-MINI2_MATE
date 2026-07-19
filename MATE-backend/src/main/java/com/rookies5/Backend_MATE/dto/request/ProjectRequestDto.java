package com.rookies5.Backend_MATE.dto.request;

import com.rookies5.Backend_MATE.entity.enums.Category;
import com.rookies5.Backend_MATE.entity.enums.OnOffline;
import com.rookies5.Backend_MATE.entity.enums.ProjectStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class ProjectRequestDto {
    private Long ownerId;

    @NotNull(message = "카테고리는 필수입니다.")
    private Category category;

    @NotBlank(message = "제목은 필수 입력 항목입니다.")
    @Size(min = 5, max = 50, message = "제목은 5~50자 이내여야 합니다")
    @Pattern(regexp = "^[^<>]*$", message = "제목에는 HTML 태그를 사용할 수 없습니다")
    private String title;

    @NotBlank(message = "내용은 필수 입력 항목입니다.")
    @Size(max = 10000, message = "내용은 10,000자 이내여야 합니다")
    @Pattern(regexp = "^[^<>]*$", message = "내용에는 HTML 태그를 사용할 수 없습니다")
    private String content;

    @NotNull(message = "모집 인원은 필수입니다.")
    @Min(value = 2, message = "방장을 포함한 총 인원은 최소 2명 이상이어야 합니다.")
    private Integer recruitCount;

    @NotNull(message = "진행 방식은 필수입니다.")
    private OnOffline onOffline;

    private ProjectStatus status;

    @NotNull(message = "마감일은 필수입니다.")
    @FutureOrPresent(message = "마감일은 오늘 이후여야 합니다.")
    private LocalDate endDate;

    private java.util.Set<String> techStacks;
}