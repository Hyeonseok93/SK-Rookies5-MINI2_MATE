package com.rookies5.Backend_MATE.repository;

import com.rookies5.Backend_MATE.entity.Project;
import com.rookies5.Backend_MATE.entity.enums.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    // 작성자(Owner)의 ID로 프로젝트 목록을 찾는 메서드 정의
    @Query("SELECT p FROM Project p WHERE p.deletedAt IS NULL AND p.owner.id = :ownerId")
    List<Project> findAllByOwnerId(@Param("ownerId") Long ownerId);

    //프로젝트 삭제 (Soft Delete)
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Project p SET p.deletedAt = CURRENT_TIMESTAMP WHERE p.id = :projectId")
    void softDeleteById(@Param("projectId") Long projectId);

    //회원 탈퇴 -> 프로젝트 삭제 (Soft Delete)
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Project p SET p.deletedAt = CURRENT_TIMESTAMP WHERE p.owner.id = :ownerId AND p.deletedAt IS NULL")
    void softDeleteAllByOwnerId(@Param("ownerId") Long ownerId);

    // 키워드 및 카테고리 통합 검색 (삭제된 프로젝트 제외)
    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN p.techStacks ts " +
            "WHERE p.deletedAt IS NULL " +
            "AND (:category IS NULL OR p.category = :category) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "     LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "     LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "     LOWER(ts) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Project> findAllWithFilters(
            @Param("category") Category category,
            @Param("keyword") String keyword,
            Pageable pageable);

    // 키워드로 프로젝트 제목, 내용, 기술 스택 통합 검색 (삭제된 프로젝트 제외) - 기존 호환용
    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN p.techStacks ts " +
            "WHERE p.deletedAt IS NULL AND (" +
            "p.title LIKE %:keyword% OR " +
            "p.content LIKE %:keyword% OR " +
            "ts LIKE %:keyword%)")
    Page<Project> searchProjects(@Param("keyword") String keyword, Pageable pageable);

    //관리자용
    @Query(value = "SELECT * FROM projects ORDER BY created_at DESC",
            countQuery = "SELECT count(*) FROM projects",
            nativeQuery = true)
    Page<Project> findAllIncludingDeleted(Pageable pageable);

    @Query(value = "SELECT * FROM projects WHERE project_id = :id", nativeQuery = true)
    Optional<Project> findByIdIncludingDeleted(@Param("id") Long id);

    @Query(value = "SELECT * FROM projects WHERE owner_id = :ownerId AND deleted_at = :deletedAt", nativeQuery = true)
    List<Project> findAllByOwnerIdAndDeletedAtIncludingDeleted(@Param("ownerId") Long ownerId,
                                                               @Param("deletedAt") LocalDateTime deletedAt);

    @Query(value = "SELECT count(*) FROM projects", nativeQuery = true)
    long countIncludingDeleted();

    @Query(value = "SELECT p.* FROM projects p JOIN users u ON u.user_id = p.owner_id " +
            "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY p.created_at DESC",
            countQuery = "SELECT count(*) FROM projects p JOIN users u ON u.user_id = p.owner_id " +
                    "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                    "OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%'))",
            nativeQuery = true)
    Page<Project> searchIncludingDeleted(@Param("keyword") String keyword, Pageable pageable);

    // ✅ 추가: 삭제되지 않은 프로젝트 전체 페이징 조회 (최신순)
    @Query("SELECT p FROM Project p WHERE p.deletedAt IS NULL")
    Page<Project> findAllActiveProjects(Pageable pageable);
}