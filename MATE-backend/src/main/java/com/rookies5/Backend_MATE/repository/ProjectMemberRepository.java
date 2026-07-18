package com.rookies5.Backend_MATE.repository;

import com.rookies5.Backend_MATE.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    // 프로젝트 ID로 팀원 목록 찾기
    List<ProjectMember> findAllByProjectId(Long projectId);

    List<ProjectMember> findAllByUserId(Long userId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    @Query(value = "SELECT * FROM project_members WHERE project_id = :projectId AND user_id = :userId", nativeQuery = true)
    Optional<ProjectMember> findByProjectIdAndUserIdIncludingDeleted(@Param("projectId") Long projectId,
                                                                     @Param("userId") Long userId);

    long countByProjectId(Long projectId);

    //프로젝트 삭제 -> 멤버 삭제
    @Modifying(clearAutomatically = true)
    @Query("UPDATE ProjectMember pm SET pm.deletedAt = CURRENT_TIMESTAMP " +
            "WHERE pm.project.id = :projectId AND pm.deletedAt IS NULL")
    void softDeleteAllByProjectId(@Param("projectId") Long projectId);

    //회원 탈퇴 -> 멤버 삭제
    @Modifying(clearAutomatically = true)
    @Query("UPDATE ProjectMember pm SET pm.deletedAt = CURRENT_TIMESTAMP WHERE pm.user.id = :userId AND pm.deletedAt IS NULL")
    void softDeleteAllByUserId(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE project_members SET deleted_at = :deletedAt WHERE project_id = :projectId AND deleted_at IS NULL", nativeQuery = true)
    int softDeleteAllByProjectIdAt(@Param("projectId") Long projectId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE project_members SET deleted_at = :deletedAt WHERE user_id = :userId AND deleted_at IS NULL", nativeQuery = true)
    int softDeleteAllByUserIdAt(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE project_members pm SET deleted_at = NULL WHERE project_id = :projectId AND deleted_at = :deletedAt " +
            "AND EXISTS (SELECT 1 FROM users u WHERE u.user_id = pm.user_id AND u.deleted_at IS NULL)", nativeQuery = true)
    int restoreAllByProjectIdDeletedAt(@Param("projectId") Long projectId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE project_members pm SET deleted_at = NULL WHERE user_id = :userId AND deleted_at = :deletedAt " +
            "AND EXISTS (SELECT 1 FROM projects p WHERE p.project_id = pm.project_id AND p.deleted_at IS NULL)", nativeQuery = true)
    int restoreAllByUserIdDeletedAt(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);
}