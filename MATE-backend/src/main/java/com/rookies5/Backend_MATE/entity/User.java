package com.rookies5.Backend_MATE.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rookies5.Backend_MATE.entity.enums.Position;
import com.rookies5.Backend_MATE.entity.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.*;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_email", columnList = "email"),
        @Index(name = "idx_nickname", columnList = "nickname"),
        @Index(name = "idx_phone_number", columnList = "phone_number")
})
@SQLRestriction("deleted_at IS NULL")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Getter
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    @Email(message = "이메일 형식이 올바르지 않습니다")
    @NotBlank(message = "이메일은 필수입니다")
    private String email;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;

    @Column(nullable = false, unique = true, length = 10)
    @Size(min = 2, max = 10, message = "닉네임은 2~10자 사이여야 합니다")
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Position position;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.ROLE_USER;

    @Column(name = "profile_img", length = 255)
    private String profileImg;

    @Column(name = "phone_number", nullable = false, unique = true, length = 20)
    @NotBlank(message = "전화번호는 필수입니다")
    private String phoneNumber;

    @Builder.Default
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_tech_stacks", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "tech_stack", length = 50)
    private Set<String> techStacks = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Project> myProjects = new ArrayList<>();

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    // 프로필 이미지 업데이트 (이미지 단독 수정/삭제 시 사용)
    public void updateProfileImg(String profileImg) {
        this.profileImg = profileImg;
    }

    public void updateProfile(String nickname, Position position, Set<String> techStacks, String phoneNumber, String encodedPassword) {
        if (nickname != null) this.nickname = nickname;
        if (position != null) this.position = position;
        if (techStacks != null) this.techStacks = techStacks;
        if (phoneNumber != null) this.phoneNumber = phoneNumber;

        // 비밀번호가 들어왔을 때만 변경 (프론트에서 수정을 원할 때만)
        if (encodedPassword != null && !encodedPassword.isBlank()) {
            this.password = encodedPassword;
        }
    }
}