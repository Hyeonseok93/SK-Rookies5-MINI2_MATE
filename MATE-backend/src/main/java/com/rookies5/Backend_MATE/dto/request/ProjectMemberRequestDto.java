package com.rookies5.Backend_MATE.dto.request;

import com.rookies5.Backend_MATE.entity.enums.MemberRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectMemberRequestDto {
    @NotNull(message = "프로젝트 ID는 필수입니다.")
    private Long projectId;

    @NotNull(message = "유저 ID는 필수입니다.")
    private Long userId;

    @NotNull(message = "멤버 권한(Role) 지정은 필수입니다.")
    private MemberRole role; // 필요시 요청에서 지정 (보통 MEMBER)
}