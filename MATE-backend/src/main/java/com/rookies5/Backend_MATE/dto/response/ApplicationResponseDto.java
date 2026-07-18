package com.rookies5.Backend_MATE.dto.response;

import com.rookies5.Backend_MATE.entity.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Builder
public class ApplicationResponseDto {
    private Long id;            // 지원서 ID (application_id)
    private Long projectId;     // 이동을 위한 원본 게시글 ID
    private String projectTitle; // 리스트에 보여줄 게시글 제목 (추가!)
    private String category;

    private Long applicantId;
    private String message;

    private String applicantNickname;
    private String applicantPosition;
    private String profileImg;

    private Set<String> techStacks;

    private String link;
    private String contact;

    private ApplicationStatus status;
    private LocalDateTime createdAt;

}