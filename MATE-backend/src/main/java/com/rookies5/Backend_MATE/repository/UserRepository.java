package com.rookies5.Backend_MATE.repository;

import com.rookies5.Backend_MATE.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

// JpaRepository<조종할 Entity 클래스, 그 Entity의 PK 데이터 타입>
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // 4.1.6 전화번호 중복 확인
    boolean existsByPhoneNumber(String phoneNumber);

    // 4.1.4 아이디 찾기용
    Optional<User> findByPhoneNumber(String phoneNumber);

    // 4.1.7 닉네임 중복 확인
    boolean existsByNickname(String nickname);

    // 4.1.8 대소문자 구분 없이 닉네임 중복 확인
    boolean existsByNicknameIgnoreCase(String nickname);

    // 4.1.9 나를 제외하고 해당 닉네임을 쓰는 사람이 있는지 확인 (마이페이지용)
    boolean existsByNicknameIgnoreCaseAndIdNot(String nickname, Long id);

    // 4.1.10 비밀번호 찾기용 (이메일과 전화번호 동시 만족)
    Optional<User> findByEmailAndPhoneNumber(String email, String phoneNumber);

    // 나(id)를 제외하고 해당 전화번호를 사용하는 사람이 있는지 확인 (마이페이지 수정용)
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, Long id);

    //회원 탈퇴
    @Modifying(clearAutomatically = true)
    @Query("UPDATE User u SET u.deletedAt = CURRENT_TIMESTAMP WHERE u.id = :userId AND u.deletedAt IS NULL")
    void softDeleteById(@Param("userId") Long userId);

    // UserRepository 및 ProjectRepository 공통 필요 메서드 예시
    @Query(value = "SELECT * FROM users ORDER BY created_at DESC",
            countQuery = "SELECT count(*) FROM users",
            nativeQuery = true)
    Page<User> findAllIncludingDeleted(Pageable pageable);

    @Query(value = "SELECT * FROM users WHERE user_id = :id", nativeQuery = true)
    Optional<User> findByIdIncludingDeleted(@Param("id") Long id);

    @Query(value = "SELECT count(*) FROM users", nativeQuery = true)
    long countIncludingDeleted();

    @Query(value = "SELECT * FROM users WHERE LOWER(nickname) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(email) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY created_at DESC",
            countQuery = "SELECT count(*) FROM users WHERE LOWER(nickname) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                    "OR LOWER(email) LIKE LOWER(CONCAT('%', :keyword, '%'))",
            nativeQuery = true)
    Page<User> searchIncludingDeleted(@Param("keyword") String keyword, Pageable pageable);

    // 기본 findByEmail은 @Where 때문에 삭제된 사용자를 못 찾음
    // 💡 Native Query를 써서 삭제된 데이터까지 강제로 뒤집니다.
    // 💡 Native Query를 사용하면 @Where 필터를 무시하고 전체 테이블에서 찾습니다.
    @Query(value = "SELECT COUNT(*) FROM users WHERE email = :email", nativeQuery = true)
    int countByEmailIncludingDeleted(@Param("email") String email);

    @Query(value = "SELECT COUNT(*) FROM users WHERE nickname = :nickname", nativeQuery = true)
    int countByNicknameIncludingDeleted(@Param("nickname") String nickname);

    @Query(value = "SELECT COUNT(*) FROM users WHERE phone_number = :phoneNumber", nativeQuery = true)
    int countByPhoneIncludingDeleted(@Param("phoneNumber") String phoneNumber);
}
