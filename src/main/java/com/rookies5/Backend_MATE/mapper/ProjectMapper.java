package com.rookies5.Backend_MATE.mapper;

import com.rookies5.Backend_MATE.dto.request.ProjectRequestDto;
import com.rookies5.Backend_MATE.dto.response.ProjectResponseDto;
import com.rookies5.Backend_MATE.entity.Project;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.entity.enums.ProjectStatus;
import org.hibernate.Hibernate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

public class ProjectMapper {

    /**
     * 1. 기존 버전 (매개변수 1개): 상세 조회, 수정, 마감 등 기존 코드용
     * 사진에서 빨간 줄 났던 부분들을 이 메서드가 처리해줍니다.
     */
    public static ProjectResponseDto mapToResponse(Project project) {
        return mapToResponse(project, null);

    }

    /**
     * 2. 마이페이지 버전 (매개변수 2개): 내 모집글/참여글 조회용
     */
    public static ProjectResponseDto mapToResponse(Project project, Long currentUserId) {
        User owner = null;

        try {
            // 프록시 초기화 여부 체크 후 접근
            if (project.getOwner() != null && Hibernate.isInitialized(project.getOwner())) {
                owner = project.getOwner();
            } else if (project.getOwner() != null) {
                owner = Hibernate.unproxy(project.getOwner(), User.class); // 프록시 해제
            }
        } catch (Exception e) {
            // 삭제된 유저이거나 초기화 실패 시 null 처리
            owner = null;
        }

        boolean isOwner = owner != null && Objects.equals(owner.getId(), currentUserId);

        Long ownerId = (owner != null && owner.getDeletedAt() == null) ? owner.getId() : null;
        String ownerNickname = (owner != null && owner.getDeletedAt() == null) ? owner.getNickname() : "삭제된 회원입니다";

        return ProjectResponseDto.builder()
                .id(project.getId())
                .ownerId(ownerId)
                .ownerNickname(ownerNickname)
                // 방장의 최신 프로필 이미지 매핑
                .ownerProfileImg(owner != null ? owner.getProfileImg() : null)
                .category(project.getCategory())
                .techStacks(project.getTechStacks())
                .title(project.getTitle())
                .content(project.getContent())
                .recruitCount(project.getRecruitCount())
                .currentCount(project.getCurrentCount())
                .status(project.getStatus())
                .onOffline(project.getOnOffline())
                .endDate(project.getEndDate())
                .deleted(project.getDeletedAt() != null)
                // D-Day 계산
                .remainingDays(project.getEndDate() != null ?
                        ChronoUnit.DAYS.between(LocalDate.now(), project.getEndDate()) : null)
                .isOwner(isOwner)
                .role(isOwner ? "OWNER" : "MEMBER")
                .build();
    }

    // Request DTO -> Entity (저장용: 방장 엔티티와 조립)
    public static Project mapToEntity(ProjectRequestDto requestDto, User owner) {
        return Project.builder()
                .owner(owner)
                .category(requestDto.getCategory())
                .title(requestDto.getTitle())
                .techStacks(requestDto.getTechStacks())
                .content(requestDto.getContent())
                .recruitCount(requestDto.getRecruitCount())
                // 방장 본인이 첫 번째 멤버이므로 보통 1로 시작하거나, 팀 규칙에 따라 0 세팅
                .currentCount(1)
                .status(ProjectStatus.RECRUITING) // 기본 상태: 모집 중
                .onOffline(requestDto.getOnOffline())
                .endDate(requestDto.getEndDate())
                .build();
    }
}