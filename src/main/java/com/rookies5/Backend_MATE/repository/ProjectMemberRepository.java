package com.rookies5.Backend_MATE.repository;

import com.rookies5.Backend_MATE.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    // 프로젝트 ID로 팀원 목록 찾기
    List<ProjectMember> findAllByProjectId(Long projectId);

    List<ProjectMember> findAllByUserId(Long userId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    //프로젝트 삭제 -> 멤버 삭제
    @Modifying(clearAutomatically = true)
    @Query("UPDATE ProjectMember pm SET pm.deletedAt = CURRENT_TIMESTAMP " +
            "WHERE pm.project.id = :projectId AND pm.deletedAt IS NULL")
    void softDeleteAllByProjectId(@Param("projectId") Long projectId);

    //회원 탈퇴 -> 멤버 삭제
    @Modifying(clearAutomatically = true)
    @Query("UPDATE ProjectMember pm SET pm.deletedAt = CURRENT_TIMESTAMP WHERE pm.user.id = :userId AND pm.deletedAt IS NULL")
    void softDeleteAllByUserId(@Param("userId") Long userId);
}