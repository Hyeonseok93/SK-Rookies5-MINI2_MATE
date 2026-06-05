package com.rookies5.Backend_MATE.dto.response;

import com.rookies5.Backend_MATE.entity.enums.Position;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
public class UserResponseDto {
    private Long id;
    private String email;
    private String nickname;
    private String phoneNumber;
    private Position position;
    private Set<String> techStacks;
    private String profileImg;
    private LocalDateTime createdAt;
    private boolean deleted;
}