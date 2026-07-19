package com.rookies5.Backend_MATE.service;

import com.rookies5.Backend_MATE.dto.request.ApplicationRequestDto;
import com.rookies5.Backend_MATE.dto.response.ApplicationResponseDto;

import java.util.List;

public interface ApplicationService {

    /**
     * 프로젝트 지원하기
     * @param requestDto 지원 정보 (projectId, applicantId, message)
     * @return 생성된 지원서 정보
     */
    ApplicationResponseDto applyToProject(Long projectId, Long applicantId, ApplicationRequestDto requestDto);

    /**
     * 특정 프로젝트의 지원자 목록 조회 (방장용)
     * @param projectId 프로젝트 ID
     * @return 지원서 리스트 (지원자 닉네임, 포지션 포함)
     */
    List<ApplicationResponseDto> getApplicationsByProjectId(Long projectId);

    /**
     * 지원 취소하기 (PENDING 상태일 때만 가능)
     * @param applicationId 지원서 ID
     */
    void deleteApplication(Long applicationId);

    /**
     * 내 신청 현황 조회 (PENDING, REJECTED 상태)
     * @param userId 조회할 유저 ID
     * @return 지원서 리스트
     */
    List<ApplicationResponseDto> getMyPendingApplications(Long userId);

    /**
     * 지원서 승인 (방장용) - ProjectMember 테이블에 팀원으로 추가
     * @param applicationId 승인할 지원서 ID
     * @return 승인된 지원서 정보
     */
    ApplicationResponseDto acceptApplication(Long applicationId);

    /**
     * 지원서 거절 (방장용)
     * @param applicationId 거절할 지원서 ID
     * @return 거절된 지원서 정보
     */
    ApplicationResponseDto rejectApplication(Long applicationId);
}