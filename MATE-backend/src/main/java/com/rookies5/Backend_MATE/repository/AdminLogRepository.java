package com.rookies5.Backend_MATE.repository;

import com.rookies5.Backend_MATE.entity.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {

    List<AdminLog> findTop100ByOrderByCreatedAtDesc(); // 최대 100개 최근 로그 조회

    long count(); // 전체 로그 개수

    AdminLog findTopByOrderByCreatedAtAsc();

}