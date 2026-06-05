package com.rookies5.Backend_MATE.service;

import com.rookies5.Backend_MATE.dto.response.ProjectMemberResponseDto;

import java.util.List;

public interface ProjectMemberService {

    /**
     * 특정 프로젝트에 참여 중인 모든 멤버 목록 조회
     * @param projectId 프로젝트 ID
     * @return 참여 멤버 리스트 (닉네임, 포지션, 가입일 포함)
     */
    List<ProjectMemberResponseDto> getMembersByProjectId(Long projectId);

    /**
     * 프로젝트에서 특정 멤버를 제외 (추방 또는 탈퇴)
     * @param memberId 프로젝트 멤버 고유 ID
     */
    void removeMember(Long memberId, Long currentUserId);
}