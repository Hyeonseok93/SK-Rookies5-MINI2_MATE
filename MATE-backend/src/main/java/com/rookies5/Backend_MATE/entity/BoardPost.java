package com.rookies5.Backend_MATE.entity;

import com.rookies5.Backend_MATE.dto.request.BoardPostRequestDto;
import com.rookies5.Backend_MATE.entity.enums.BoardPostType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "board_posts")
@SQLRestriction("deleted_at IS NULL")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Getter
public class BoardPost extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "제목은 필수입니다")
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @Enumerated(EnumType.STRING)
    private BoardPostType type;

    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    public void incrementViewCount() { this.viewCount++; }

    public void updatePost(BoardPostRequestDto requestDto) {
        // 값이 들어온 것만 업데이트합니다. (PATCH 방식의 핵심)
        if (requestDto.getTitle() != null) {
            this.title = requestDto.getTitle();
        }
        if (requestDto.getContent() != null) {
            this.content = requestDto.getContent();
        }
    }
}