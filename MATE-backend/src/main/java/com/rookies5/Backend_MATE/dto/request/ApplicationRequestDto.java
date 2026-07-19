package com.rookies5.Backend_MATE.dto.request;

import com.rookies5.Backend_MATE.entity.enums.Position;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationRequestDto {
    private Long projectId;

    private Long applicantId;

    @NotBlank(message = "지원 동기는 필수 입력 항목입니다.")
    @Size(min = 10, max = 500, message = "지원 동기는 10~500자 사이여야 합니다")
    @Pattern(regexp = "^[^<>]*$", message = "지원 동기에는 HTML 태그를 사용할 수 없습니다")
    private String message;

    // ✅ 추가: 사용자가 지원할 때 선택하는 포지션
    @NotNull(message = "지원 포지션은 필수 입력 항목입니다.")
    private Position position;

    @Size(max = 255, message = "참고 링크는 255자 이내여야 합니다")
    @Pattern(
            regexp = "^$|https?://[^\\s<>]+$",
            message = "참고 링크는 http:// 또는 https://로 시작하는 주소여야 합니다"
    )
    private String link;    // 포트폴리오/깃허브 링크

    @NotBlank(message = "소통 채널은 필수 입력 항목입니다.")
    @Size(max = 255, message = "소통 채널은 255자 이내여야 합니다")
    @Pattern(regexp = "^[^<>\\p{Cntrl}]*$", message = "소통 채널에 허용되지 않는 문자가 포함되어 있습니다")
    private String contact; // 오픈채팅/연락처
}
