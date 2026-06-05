package com.rookies5.Backend_MATE.dto.request;

import com.rookies5.Backend_MATE.entity.enums.Position;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty; // 👈 추가
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import java.util.Set;

@Getter
@Setter
public class UserRequestDto {
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    private String nickname;

    @NotBlank(message = "전화번호는 필수입니다.")
    @Pattern(regexp = "^\\d{11}$", message = "하이픈(-) 없이 숫자만 입력해주세요.")
    private String phoneNumber;

    @NotNull(message = "포지션은 필수입니다.")
    private Position position;

    @NotEmpty(message = "기술 스택은 최소 1개 이상 선택해야 합니다.")
    private Set<String> techStacks;

    private String profileImg;
}