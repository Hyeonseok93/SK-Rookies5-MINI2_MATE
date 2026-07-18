package com.rookies5.Backend_MATE.repository;

import com.rookies5.Backend_MATE.entity.RefreshToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findAllByUserIdAndRevokedAtIsNull(Long userId);

    List<RefreshToken> findAllByFamilyIdAndRevokedAtIsNull(String familyId);

    void deleteByUserId(Long userId);
}