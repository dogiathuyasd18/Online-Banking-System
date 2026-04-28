package com.banking.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.banking.dto.ApiResponse;
import com.banking.dto.ApprovalDecisionDTO;
import com.banking.dto.ApprovalRequestDTO;
import com.banking.dto.ApprovalRequestResponseDTO;
import com.banking.service.ApprovalRequestService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/approval-requests")
public class ApprovalRequestController {

    private final ApprovalRequestService approvalRequestService;

    public ApprovalRequestController(ApprovalRequestService approvalRequestService) {
        this.approvalRequestService = approvalRequestService;
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<ApprovalRequestResponseDTO>> createDepositRequest(
            @Valid @RequestBody ApprovalRequestDTO dto,
            Authentication authentication) {
        ApprovalRequestResponseDTO response = approvalRequestService.createDepositRequest(dto, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(200, "Deposit request submitted for approval", response));
    }

    @PostMapping("/withdrawal")
    public ResponseEntity<ApiResponse<ApprovalRequestResponseDTO>> createWithdrawalRequest(
            @Valid @RequestBody ApprovalRequestDTO dto,
            Authentication authentication) {
        ApprovalRequestResponseDTO response = approvalRequestService.createWithdrawalRequest(dto, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(200, "Withdrawal request submitted for approval", response));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ApprovalRequestResponseDTO>>> getPendingRequests() {
        List<ApprovalRequestResponseDTO> response = approvalRequestService.getPendingRequests();
        return ResponseEntity.ok(new ApiResponse<>(200, "Pending approval requests fetched", response));
    }

    @PostMapping("/{requestId}/decision")
    public ResponseEntity<ApiResponse<ApprovalRequestResponseDTO>> decideRequest(
            @PathVariable String requestId,
            @Valid @RequestBody ApprovalDecisionDTO dto,
            Authentication authentication) {
        ApprovalRequestResponseDTO response;
        if ("approve".equalsIgnoreCase(dto.getDecision())) {
            response = approvalRequestService.approveRequest(requestId, authentication.getName());
            return ResponseEntity.ok(new ApiResponse<>(200, "Approval request accepted", response));
        }
        if ("reject".equalsIgnoreCase(dto.getDecision())) {
            response = approvalRequestService.rejectRequest(requestId, authentication.getName(), dto.getNote());
            return ResponseEntity.ok(new ApiResponse<>(200, "Approval request rejected", response));
        }
        return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Decision must be approve or reject", null));
    }
}
