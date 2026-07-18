package com.rookies5.Backend_MATE.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "family_id", nullable = false, length = 36)
    private String familyId;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "replaced_by_hash", length = 64)
    private String replacedByHash;

    @Builder
    public RefreshToken(Long userId, String familyId, String tokenHash, LocalDateTime expiresAt) {
        this.userId = userId;
        this.familyId = familyId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public void rotate(String replacementHash) {
        this.revokedAt = LocalDateTime.now();
        this.replacedByHash = replacementHash;
    }

    public void revoke() {
        if (this.revokedAt == null) {
            this.revokedAt = LocalDateTime.now();
        }
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }
}