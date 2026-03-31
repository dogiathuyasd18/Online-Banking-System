package com.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.banking.entity.Credential;

@Repository
public interface CredentialRepository extends JpaRepository<Credential, String> {

    // 1. FOR SECURITY: Check if MFA (Multi-Factor Auth) is enabled for a user
    boolean existsByUserIdAndMfaEnabledTrue(String userId);

    // 2. FOR AUDIT: Find credentials that haven't logged in for a long time
    // List<Credential> findByLastLoginBefore(LocalDateTime threshold);
}