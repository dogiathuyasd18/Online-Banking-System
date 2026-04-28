package com.banking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.banking.entity.ApprovalStatus;
import com.banking.entity.TransactionApprovalRequest;

@Repository
public interface TransactionApprovalRequestRepository extends JpaRepository<TransactionApprovalRequest, String> {
    List<TransactionApprovalRequest> findByStatusOrderByRequestedAtDesc(ApprovalStatus status);
}
