package com.banking.repository;

import com.banking.entity.SecurityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecurityLogRepository extends JpaRepository<SecurityLog, Long> {

    // FOR AUDIT: Find logs for a specific user, paginated
    // If a user has 10,000 logs, this only fetches 20 at a time
    Page<SecurityLog> findByUser_UserId(String userId, Pageable pageable);

    // FOR SECURITY: Find all "FAILED_LOGIN" attempts from a specific IP
    long countByActionAndIpAddress(String action, String ipAddress);
}