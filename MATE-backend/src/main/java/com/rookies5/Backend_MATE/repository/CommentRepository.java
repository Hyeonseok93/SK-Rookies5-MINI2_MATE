package com.rookies5.Backend_MATE.repository;

import com.rookies5.Backend_MATE.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.LocalDateTime;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findAllByPostIdOrderByCreatedAtAsc(Long postId);

    //프로젝트 삭제 -> 댓글 삭제
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Comment c SET c.deletedAt = CURRENT_TIMESTAMP " +
            "WHERE c.post.id IN (SELECT b.id FROM BoardPost b WHERE b.project.id = :projectId) " +
            "AND c.deletedAt IS NULL")
    void softDeleteAllByProjectId(@Param("projectId") Long projectId);

    //게시글 삭제 -> 댓글 삭제
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Comment c SET c.deletedAt = CURRENT_TIMESTAMP " +
            "WHERE c.post.id = :postId AND c.deletedAt IS NULL")
    void softDeleteAllByPostId(@Param("postId") Long postId);

    //댓글 삭제
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Comment c SET c.deletedAt = CURRENT_TIMESTAMP WHERE c.id = :commentId AND c.deletedAt IS NULL")
    void softDeleteById(@Param("commentId") Long commentId);

    //회원 탈퇴 -> 댓글 삭제
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Comment c SET c.deletedAt = CURRENT_TIMESTAMP WHERE c.author.id = :userId AND c.deletedAt IS NULL")
    void softDeleteAllByAuthorId(@Param("userId") Long userId);

    //방장 멤버 강제 탈퇴 -> 댓글 삭제
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Comment c SET c.deletedAt = CURRENT_TIMESTAMP " +
            "WHERE c.post.id IN (SELECT b.id FROM BoardPost b WHERE b.project.id = :projectId) " + // b.deletedAt 조건 제거
            "AND c.author.id = :authorId " +
            "AND c.deletedAt IS NULL")
    void softDeleteAllByProjectIdAndAuthorId(@Param("projectId") Long projectId, @Param("authorId") Long authorId);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE comments SET deleted_at = :deletedAt WHERE post_id IN " +
            "(SELECT post_id FROM board_posts WHERE project_id = :projectId) AND deleted_at IS NULL", nativeQuery = true)
    int softDeleteAllByProjectIdAt(@Param("projectId") Long projectId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE comments SET deleted_at = :deletedAt WHERE author_id = :userId AND deleted_at IS NULL", nativeQuery = true)
    int softDeleteAllByAuthorIdAt(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE comments c SET deleted_at = NULL WHERE deleted_at = :deletedAt " +
            "AND post_id IN (SELECT post_id FROM board_posts WHERE project_id = :projectId AND deleted_at IS NULL) " +
            "AND EXISTS (SELECT 1 FROM users u WHERE u.user_id = c.author_id AND u.deleted_at IS NULL)", nativeQuery = true)
    int restoreAllByProjectIdDeletedAt(@Param("projectId") Long projectId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE comments c SET deleted_at = NULL WHERE author_id = :userId AND deleted_at = :deletedAt " +
            "AND EXISTS (SELECT 1 FROM board_posts b WHERE b.post_id = c.post_id AND b.deleted_at IS NULL)", nativeQuery = true)
    int restoreAllByAuthorIdDeletedAt(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);
}

