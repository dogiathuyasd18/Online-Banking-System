package com.banking.service;

import java.util.List;

import com.banking.dto.ApprovalRequestDTO;
import com.banking.dto.ApprovalRequestResponseDTO;

public interface ApprovalRequestService {
    ApprovalRequestResponseDTO createDepositRequest(ApprovalRequestDTO dto, String requesterEmail);

    ApprovalRequestResponseDTO createWithdrawalRequest(ApprovalRequestDTO dto, String requesterEmail);

    List<ApprovalRequestResponseDTO> getPendingRequests();

    ApprovalRequestResponseDTO approveRequest(String requestId, String approverEmail);

    ApprovalRequestResponseDTO rejectRequest(String requestId, String approverEmail, String note);
}
