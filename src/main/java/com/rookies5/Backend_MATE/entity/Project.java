package com.rookies5.Backend_MATE.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.rookies5.Backend_MATE.dto.request.ProjectRequestDto;
import com.rookies5.Backend_MATE.entity.BaseEntity;
import com.rookies5.Backend_MATE.entity.enums.Category;
import com.rookies5.Backend_MATE.entity.enums.OnOffline;
import com.rookies5.Backend_MATE.entity.enums.ProjectStatus;
import com.rookies5.Backend_MATE.exception.BusinessException;
import com.rookies5.Backend_MATE.exception.ErrorCode;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.Where;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Where(clause = "deleted_at IS NULL")
@Table(name = "projects", indexes = {@Index(name = "idx_status", columnList = "status")})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Getter
public class Project extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnoreProperties({"myProjects"})
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category category;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "제목은 필수입니다")
    @Size(min = 5, max = 50, message = "제목은 5~50자 이내여야 합니다")
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @Column(name = "recruit_count", nullable = false)
    @Min(value = 1, message = "모집 인원은 1명 이상이어야 합니다")
    @Max(value = 20, message = "모집 인원은 20명을 넘을 수 없습니다")
    private Integer recruitCount;

    @Builder.Default
    @Column(name = "current_count", nullable = false)
    private Integer currentCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "on_offline", nullable = false, length = 20)
    private OnOffline onOffline;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status = ProjectStatus.RECRUITING;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "project_tech_stacks", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "tech_stack_name")
    @Builder.Default
    private java.util.Set<String> techStacks = new java.util.HashSet<>();

    public void addMember() {
        if (this.currentCount >= this.recruitCount) {
            throw new IllegalStateException("모집 정원이 가득 찼습니다.");
        }
        this.currentCount++;
        if (this.currentCount.equals(this.recruitCount)) {
            this.status = ProjectStatus.CLOSED; // 정원 충족 시 상태 자동 마감
        }
    }

    // 모집 수동 마감
    public void closeRecruitment() {
        this.status = ProjectStatus.CLOSED;
    }

    // 인원수 감소 로직 추가
    public void decreaseCurrentCount() {
        if (this.currentCount > 0) {
            this.currentCount--;
        }
    }

    public void updateProject(ProjectRequestDto dto) {
        if (dto.getCategory() != null) this.category = dto.getCategory();
        if (dto.getTitle() != null) this.title = dto.getTitle();
        if (dto.getContent() != null) this.content = dto.getContent();
        if (dto.getRecruitCount() != null) this.recruitCount = dto.getRecruitCount();
        if (dto.getOnOffline() != null) this.onOffline = dto.getOnOffline();
        if (dto.getEndDate() != null) this.endDate = dto.getEndDate();
        if (dto.getStatus() != null) this.status = dto.getStatus();
        // 기술스택 업데이트 로직 추가
        if (dto.getTechStacks() != null) {
            this.techStacks.clear();
            this.techStacks.addAll(dto.getTechStacks());
        }
    }

    // 모집글 수동마감 후 다시 재오픈
    public void reopen(int newRecruitCount, LocalDate newEndDate) {
        // 1. 인원 검증
        if (newRecruitCount <= this.currentCount) {
            throw new BusinessException(ErrorCode.PROJECT_RECRUIT_COUNT_INVALID);
        }

        // 2. 기간 검증
        if (newEndDate.isBefore(LocalDate.now())) {
            throw new BusinessException(ErrorCode.PROJECT_END_DATE_INVALID);
        }

        this.recruitCount = newRecruitCount;
        this.endDate = newEndDate;
        this.status = ProjectStatus.RECRUITING;
    }
}