package com.rookies5.Backend_MATE.service;

import com.rookies5.Backend_MATE.entity.Project;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.EntityNotFoundException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import com.rookies5.Backend_MATE.repository.ApplicationRepository;
import com.rookies5.Backend_MATE.repository.BoardPostRepository;
import com.rookies5.Backend_MATE.repository.CommentRepository;
import com.rookies5.Backend_MATE.repository.ProjectMemberRepository;
import com.rookies5.Backend_MATE.repository.ProjectRepository;
import com.rookies5.Backend_MATE.repository.RefreshTokenRepository;
import com.rookies5.Backend_MATE.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Owns aggregate deletion and restoration for both REST and admin entry points.
 *
 * Cascade rows receive the parent's exact deletion timestamp. Restore only revives rows
 * carrying that timestamp, so rows deleted independently are never guessed at or revived.
 * Legacy deletions used separate database timestamps and are therefore restored
 * conservatively: the parent can be restored while ambiguous children stay deleted.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DomainDeletionService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ApplicationRepository applicationRepository;
    private final BoardPostRepository boardPostRepository;
    private final CommentRepository commentRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public User deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND, userId));
        LocalDateTime deletedAt = cascadeTimestamp();

        for (Project project : projectRepository.findAllByOwnerId(userId)) {
            deleteProject(project, deletedAt);
        }
        commentRepository.softDeleteAllByAuthorIdAt(userId, deletedAt);
        boardPostRepository.softDeleteAllByAuthorIdAt(userId, deletedAt);
        applicationRepository.softDeleteAllByApplicantIdAt(userId, deletedAt);
        projectMemberRepository.softDeleteAllByUserIdAt(userId, deletedAt);
        refreshTokenRepository.deleteByUserId(userId);
        user.setDeletedAt(deletedAt);
        return userRepository.save(user);
    }

    public User restoreUser(Long userId) {
        User user = userRepository.findByIdIncludingDeleted(userId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND, userId));
        LocalDateTime deletedAt = user.getDeletedAt();
        if (deletedAt == null) {
            return user;
        }

        user.restore();
        userRepository.saveAndFlush(user);

        List<Project> cascadeProjects =
                projectRepository.findAllByOwnerIdAndDeletedAtIncludingDeleted(userId, deletedAt);
        for (Project project : cascadeProjects) {
            restoreProject(project);
        }

        // Restore only this user's rows from the same cascade and only under active parents.
        boardPostRepository.restoreAllByAuthorIdDeletedAt(userId, deletedAt);
        commentRepository.restoreAllByAuthorIdDeletedAt(userId, deletedAt);
        applicationRepository.restoreAllByApplicantIdDeletedAt(userId, deletedAt);
        projectMemberRepository.restoreAllByUserIdDeletedAt(userId, deletedAt);
        synchronizeProjectCountsForUser(userId);
        return user;
    }

    public Project deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.PROJECT_NOT_FOUND, projectId));
        deleteProject(project, cascadeTimestamp());
        return project;
    }

    public Project restoreProject(Long projectId) {
        Project project = projectRepository.findByIdIncludingDeleted(projectId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.PROJECT_NOT_FOUND, projectId));
        return restoreProject(project);
    }

    private void deleteProject(Project project, LocalDateTime deletedAt) {
        Long projectId = project.getId();
        commentRepository.softDeleteAllByProjectIdAt(projectId, deletedAt);
        boardPostRepository.softDeleteAllByProjectIdAt(projectId, deletedAt);
        applicationRepository.softDeleteAllByProjectIdAt(projectId, deletedAt);
        projectMemberRepository.softDeleteAllByProjectIdAt(projectId, deletedAt);
        project.setDeletedAt(deletedAt);
        projectRepository.save(project);
    }

    private Project restoreProject(Project project) {
        LocalDateTime deletedAt = project.getDeletedAt();
        if (deletedAt == null) {
            synchronizeProjectCount(project);
            return project;
        }
        User owner = userRepository.findByIdIncludingDeleted(project.getOwner().getId())
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND, project.getOwner().getId()));
        if (owner.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Restore the deleted project owner first.");
        }

        project.restore();
        projectRepository.saveAndFlush(project);
        projectMemberRepository.restoreAllByProjectIdDeletedAt(project.getId(), deletedAt);
        applicationRepository.restoreAllByProjectIdDeletedAt(project.getId(), deletedAt);
        boardPostRepository.restoreAllByProjectIdDeletedAt(project.getId(), deletedAt);
        commentRepository.restoreAllByProjectIdDeletedAt(project.getId(), deletedAt);
        synchronizeProjectCount(project);
        return project;
    }

    private void synchronizeProjectCountsForUser(Long userId) {
        projectMemberRepository.findAllByUserId(userId).stream()
                .map(member -> member.getProject())
                .distinct()
                .forEach(this::synchronizeProjectCount);
    }

    private void synchronizeProjectCount(Project project) {
        int activeMembers = Math.toIntExact(projectMemberRepository.countByProjectId(project.getId()));
        project.synchronizeCurrentCount(activeMembers);
        projectRepository.save(project);
    }

    private LocalDateTime cascadeTimestamp() {
        return LocalDateTime.now().truncatedTo(ChronoUnit.MICROS);
    }
}
