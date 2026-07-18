package com.rookies5.Backend_MATE.controller;

import com.rookies5.Backend_MATE.dto.response.ProjectResponseDto;
import com.rookies5.Backend_MATE.dto.response.UserResponseDto;
import com.rookies5.Backend_MATE.entity.AdminLog;
import com.rookies5.Backend_MATE.entity.Project;
import com.rookies5.Backend_MATE.entity.User;
import com.rookies5.Backend_MATE.mapper.ProjectMapper;
import com.rookies5.Backend_MATE.mapper.UserMapper;
import com.rookies5.Backend_MATE.exception.EntityNotFoundException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import com.rookies5.Backend_MATE.repository.AdminLogRepository;
import com.rookies5.Backend_MATE.repository.ProjectRepository;
import com.rookies5.Backend_MATE.repository.UserRepository;
import com.rookies5.Backend_MATE.service.DomainDeletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final AdminLogRepository adminLogRepository;
    private final DomainDeletionService domainDeletionService;

    private final int PAGE_SIZE = 5;

    // -------------------------
    // ✅ 로그 추가 유틸
    // -------------------------
    private void addLog(String message) {
        // 로그 100개 이상이면 가장 오래된 로그 삭제
        if (adminLogRepository.count() >= 100) {
            AdminLog oldest = adminLogRepository.findTopByOrderByCreatedAtAsc();
            if (oldest != null) {
                adminLogRepository.delete(oldest);
            }
        }
        // 새 로그 저장
        AdminLog log = AdminLog.builder()
                .action(message)
                .createdAt(LocalDateTime.now())
                .build();
        adminLogRepository.save(log);
    }


    // ================== 대시보드 ==================
    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public String dashboard(@RequestParam(defaultValue = "0") int userPage,
                            @RequestParam(defaultValue = "0") int projectPage,
                            @RequestParam(defaultValue = "0") int logPage,
                            Model model) {

        // 회원 페이징
        Page<UserResponseDto> users = userRepository
                .findAllIncludingDeleted(PageRequest.of(userPage, PAGE_SIZE))
                .map(user -> {
                    UserResponseDto dto = UserMapper.mapToUserResponse(user);
                    dto.setDeleted(user.getDeletedAt() != null);
                    return dto;
                });

        // 프로젝트 페이징
        Page<ProjectResponseDto> projects = projectRepository
                .findAllIncludingDeleted(PageRequest.of(projectPage, PAGE_SIZE))
                .map(ProjectMapper::mapToResponse);

        // 로그 페이징 (최신순)
        Pageable logPageable = PageRequest.of(logPage, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminLog> logs = adminLogRepository.findAll(logPageable);

        model.addAttribute("userCount", userRepository.countIncludingDeleted());
        model.addAttribute("projectCount", projectRepository.countIncludingDeleted());
        model.addAttribute("users", users);
        model.addAttribute("projects", projects);
        model.addAttribute("logs", logs);

        return "admin/dashboard";
    }

    // ================== 회원 ==================
    @GetMapping("/users")
    @Transactional(readOnly = true)
    public String userManagement(@RequestParam(defaultValue = "0") int userPage, Model model) {
        Page<UserResponseDto> users = userRepository
                .findAllIncludingDeleted(PageRequest.of(userPage, PAGE_SIZE))
                .map(user -> {
                    UserResponseDto dto = UserMapper.mapToUserResponse(user);
                    dto.setDeleted(user.getDeletedAt() != null);
                    return dto;
                });
        model.addAttribute("users", users);
        return "admin/users";
    }

    @GetMapping("/logs")
    public String logManagement(@RequestParam(defaultValue = "0") int logPage,
                                @RequestParam(required = false) String keyword,
                                Model model) {
        int LOG_PAGE_SIZE = 20; // 1페이지당 20개
        Pageable pageable = PageRequest.of(logPage, LOG_PAGE_SIZE, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminLog> logs = adminLogRepository.findAll(pageable);
        model.addAttribute("logs", logs);
        model.addAttribute("keyword", keyword);
        return "admin/logs"; // logs.html
    }

    // 회원 상세 (모달용)
    @GetMapping("/users/{id}")
    @ResponseBody
    @Transactional(readOnly = true)
    public UserResponseDto getUserDetail(@PathVariable Long id) {
        return userRepository.findByIdIncludingDeleted(id)
                .map(UserMapper::mapToUserResponse)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND, id));
    }

    @PostMapping("/users/delete/{id}")
    @Transactional
    public String deleteUser(@PathVariable Long id,
                             @RequestParam(defaultValue = "0") int userPage,
                             @RequestParam(required = false) String redirectPage) {

        User user = domainDeletionService.deleteUser(id);
        addLog(user.getNickname() + "님 계정을 삭제했습니다.");

        if ("users".equals(redirectPage)) {
            return "redirect:/admin/users?userPage=" + userPage;
        }
        return "redirect:/admin/dashboard?userPage=" + userPage;
    }

    @PostMapping("/users/restore/{id}")
    @Transactional
    public String restoreUser(@PathVariable Long id,
                              @RequestParam(defaultValue = "0") int userPage,
                              @RequestParam(required = false) String redirectPage) {

        User user = domainDeletionService.restoreUser(id);
        addLog(user.getNickname() + "님 계정을 복구했습니다.");

        if ("users".equals(redirectPage)) {
            return "redirect:/admin/users?userPage=" + userPage;
        }
        return "redirect:/admin/dashboard?userPage=" + userPage;
    }

    // ================== 프로젝트 ==================
    @Transactional(readOnly = true)
    @GetMapping("/projects")
    public String projectManagement(@RequestParam(defaultValue = "0") int projectPage, Model model) {
        Page<ProjectResponseDto> projects = projectRepository
                .findAllIncludingDeleted(PageRequest.of(projectPage, PAGE_SIZE))
                .map(ProjectMapper::mapToResponse);
        model.addAttribute("projects", projects);
        return "admin/projects";
    }

    // 프로젝트 상세 (모달용)
    @GetMapping("/projects/{id}")
    @ResponseBody
    @Transactional(readOnly = true)
    public ProjectResponseDto getProjectDetail(@PathVariable Long id) {
        Project project = projectRepository.findByIdIncludingDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.PROJECT_NOT_FOUND, id));
        return ProjectMapper.mapToResponse(project);
    }

    @PostMapping("/projects/delete/{id}")
    @Transactional
    public String deleteProject(@PathVariable Long id,
                                @RequestParam(defaultValue = "0") int projectPage,
                                @RequestParam(required = false) String redirectPage) {

        Project project = domainDeletionService.deleteProject(id);
        addLog(project.getTitle() + " 프로젝트를 삭제했습니다.");

        if ("projects".equals(redirectPage)) {
            return "redirect:/admin/projects?projectPage=" + projectPage;
        }
        return "redirect:/admin/dashboard?projectPage=" + projectPage;
    }

    @PostMapping("/projects/restore/{id}")
    @Transactional
    public String restoreProject(@PathVariable Long id,
                                 @RequestParam(defaultValue = "0") int projectPage,
                                 @RequestParam(required = false) String keyword,
                                 @RequestParam(required = false) String redirectPage) {

        Project project = domainDeletionService.restoreProject(id);
        addLog(project.getTitle() + " 프로젝트를 복구했습니다.");

        if ("projects".equals(redirectPage)) {
            return "redirect:/admin/projects?projectPage=" + projectPage;
        }
        return "redirect:/admin/dashboard?projectPage=" + projectPage;
    }

    // ================== 검색 ==================
    @GetMapping("/search")
    @Transactional(readOnly = true)
    public String search(@RequestParam String keyword,
                         @RequestParam(defaultValue = "0") int userPage,
                         @RequestParam(defaultValue = "0") int projectPage,
                         @RequestParam(defaultValue = "0") int logPage,
                         @RequestParam(required = false, defaultValue = "dashboard") String redirectPage,
                         Model model) {

        // -----------------------------
        // 1️⃣ 회원 검색
        // -----------------------------
        Page<UserResponseDto> users;
        if (keyword == null || keyword.isBlank()) {
            users = userRepository.findAllIncludingDeleted(PageRequest.of(userPage, PAGE_SIZE))
                    .map(u -> {
                        UserResponseDto dto = UserMapper.mapToUserResponse(u);
                        dto.setDeleted(u.getDeletedAt() != null);
                        return dto;
                    });
        } else {
            users = userRepository.searchIncludingDeleted(keyword, PageRequest.of(userPage, PAGE_SIZE))
                    .map(u -> {
                        UserResponseDto dto = UserMapper.mapToUserResponse(u);
                        dto.setDeleted(u.getDeletedAt() != null);
                        return dto;
                    });
        }

        // -----------------------------
        // 2️⃣ 프로젝트 검색 (제목 + 작성자)
        // -----------------------------
        Page<ProjectResponseDto> projects;
        if (keyword == null || keyword.isBlank()) {
            projects = projectRepository.findAllIncludingDeleted(PageRequest.of(projectPage, PAGE_SIZE))
                    .map(ProjectMapper::mapToResponse);
        } else {
            projects = projectRepository.searchIncludingDeleted(keyword, PageRequest.of(projectPage, PAGE_SIZE))
                    .map(ProjectMapper::mapToResponse);
        }

        // -----------------------------
        // 3️⃣ 로그 검색
        // -----------------------------
        Page<AdminLog> logs;
        int LOG_PAGE_SIZE = 10;
        if (keyword == null || keyword.isBlank()) {
            logs = adminLogRepository.findAll(PageRequest.of(logPage, LOG_PAGE_SIZE, Sort.by(Sort.Direction.DESC, "createdAt")));
        } else {
            logs = adminLogRepository.findByActionContainingIgnoreCase(keyword,
                    PageRequest.of(logPage, LOG_PAGE_SIZE, Sort.by(Sort.Direction.DESC, "createdAt")));
        }

        // -----------------------------
        // 화면 선택
        // -----------------------------
        if ("users".equals(redirectPage)) {
            model.addAttribute("users", users);
            model.addAttribute("keyword", keyword);
            return "admin/users";
        }

        if ("projects".equals(redirectPage)) {
            model.addAttribute("projects", projects);
            model.addAttribute("keyword", keyword);
            return "admin/projects";
        }

        // 대시보드 검색
        model.addAttribute("userCount", userRepository.countIncludingDeleted());
        model.addAttribute("projectCount", projectRepository.countIncludingDeleted());
        model.addAttribute("users", users);
        model.addAttribute("projects", projects);
        model.addAttribute("logs", logs);
        model.addAttribute("keyword", keyword);

        return "admin/dashboard";
    }

    // ================== 로그인 페이지 ==================
    @GetMapping("/login")
    public String loginPage() {
        return "admin/login";
    }
}