package com.banking.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.dto.ApprovalRequestDTO;
import com.banking.dto.ApprovalRequestResponseDTO;
import com.banking.dto.DepositDTO;
import com.banking.entity.Account;
import com.banking.entity.ApprovalRequestType;
import com.banking.entity.ApprovalStatus;
import com.banking.entity.TransactionApprovalRequest;
import com.banking.entity.User;
import com.banking.entity.UserRole;
import com.banking.exception.BankingServiceException;
import com.banking.notification.ApprovalRequestSubject;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionApprovalRequestRepository;
import com.banking.repository.UserRepository;
import com.banking.service.AccountService;
import com.banking.service.ApprovalRequestService;

@Service
public class ApprovalRequestServiceImpl implements ApprovalRequestService {
    private final TransactionApprovalRequestRepository approvalRequestRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountService accountService;
    private final ApprovalRequestSubject approvalRequestSubject;

    public ApprovalRequestServiceImpl(
            TransactionApprovalRequestRepository approvalRequestRepository,
            AccountRepository accountRepository,
            UserRepository userRepository,
            AccountService accountService,
            ApprovalRequestSubject approvalRequestSubject) {
        this.approvalRequestRepository = approvalRequestRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.accountService = accountService;
        this.approvalRequestSubject = approvalRequestSubject;
    }

    @Override
    @Transactional
    public ApprovalRequestResponseDTO createDepositRequest(ApprovalRequestDTO dto, String requesterEmail) {
        return createRequest(dto, requesterEmail, ApprovalRequestType.deposit);
    }

    @Override
    @Transactional
    public ApprovalRequestResponseDTO createWithdrawalRequest(ApprovalRequestDTO dto, String requesterEmail) {
        return createRequest(dto, requesterEmail, ApprovalRequestType.withdrawal);
    }

    @Override
    public List<ApprovalRequestResponseDTO> getPendingRequests() {
        return approvalRequestRepository.findByStatusOrderByRequestedAtDesc(ApprovalStatus.pending).stream()
                .map(ApprovalRequestResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApprovalRequestResponseDTO approveRequest(String requestId, String approverEmail) {
        TransactionApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new BankingServiceException(
                        "Approval request not found: " + requestId,
                        "APPROVAL_REQUEST_NOT_FOUND"));

        if (request.getStatus() != ApprovalStatus.pending) {
            throw new BankingServiceException(
                    "Approval request has already been processed",
                    "APPROVAL_REQUEST_ALREADY_PROCESSED");
        }

        User approver = getUserByEmail(approverEmail);
        ensureApproverRole(approver);

        DepositDTO operation = new DepositDTO();
        operation.setReceiverAccountId(request.getAccount().getAccountId());
        operation.setAmount(request.getAmount());
        operation.setDescription(request.getDescription());

        switch (request.getRequestType()) {
            case deposit -> accountService.depositAccount(request.getAccount(), operation);
            case withdrawal -> accountService.withdrawalAccount(request.getAccount(), operation);
            default -> throw new BankingServiceException("Unsupported request type", "INVALID_APPROVAL_REQUEST_TYPE");
        }

        request.setStatus(ApprovalStatus.approved);
        request.setProcessedBy(approver);
        request.setProcessedAt(LocalDateTime.now());
        TransactionApprovalRequest saved = approvalRequestRepository.save(request);
        approvalRequestSubject.notifyRequestResolved(saved);
        return ApprovalRequestResponseDTO.fromEntity(saved);
    }

    @Override
    @Transactional
    public ApprovalRequestResponseDTO rejectRequest(String requestId, String approverEmail, String note) {
        TransactionApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new BankingServiceException(
                        "Approval request not found: " + requestId,
                        "APPROVAL_REQUEST_NOT_FOUND"));

        if (request.getStatus() != ApprovalStatus.pending) {
            throw new BankingServiceException(
                    "Approval request has already been processed",
                    "APPROVAL_REQUEST_ALREADY_PROCESSED");
        }

        User approver = getUserByEmail(approverEmail);
        ensureApproverRole(approver);

        request.setStatus(ApprovalStatus.rejected);
        request.setProcessedBy(approver);
        request.setProcessedAt(LocalDateTime.now());
        if (note != null && !note.isBlank()) {
            request.setDescription(request.getDescription() + " | Reject note: " + note);
        }

        TransactionApprovalRequest saved = approvalRequestRepository.save(request);
        approvalRequestSubject.notifyRequestResolved(saved);
        return ApprovalRequestResponseDTO.fromEntity(saved);
    }

    private ApprovalRequestResponseDTO createRequest(ApprovalRequestDTO dto, String requesterEmail, ApprovalRequestType type) {
        User requester = getUserByEmail(requesterEmail);
        Account account = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new BankingServiceException(
                        "Account not found with ID: " + dto.getAccountId(),
                        "ACCOUNT_NOT_FOUND"));

        ensureRequesterCanUseAccount(requester, account);

        TransactionApprovalRequest request = new TransactionApprovalRequest();
        request.setAccount(account);
        request.setRequestedBy(requester);
        request.setRequestType(type);
        request.setAmount(dto.getAmount());
        request.setDescription(dto.getDescription());
        request.setStatus(ApprovalStatus.pending);
        request.setRequestedAt(LocalDateTime.now());

        TransactionApprovalRequest saved = approvalRequestRepository.save(request);
        approvalRequestSubject.notifyRequestCreated(saved);
        return ApprovalRequestResponseDTO.fromEntity(saved);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BankingServiceException("User not found: " + email, "USER_NOT_FOUND"));
    }

    private void ensureRequesterCanUseAccount(User requester, Account account) {
        if (hasAnyRole(requester, "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_STAFF", "ROLE_TELLER")) {
            return;
        }
        if (account.getUser() == null || account.getUser().getEmail() == null
                || !account.getUser().getEmail().equals(requester.getEmail())) {
            throw new BankingServiceException("You are not allowed to use this account", "ACCOUNT_ACCESS_DENIED");
        }
    }

    private void ensureApproverRole(User approver) {
        if (!hasAnyRole(approver, "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_STAFF", "ROLE_TELLER")) {
            throw new BankingServiceException("Only staff/admin can process this request", "APPROVAL_ROLE_REQUIRED");
        }
    }

    private boolean hasAnyRole(User user, String... targetRoles) {
        if (user.getUserRoles() == null) {
            return false;
        }
        for (UserRole userRole : user.getUserRoles()) {
            if (userRole.getRole() == null || userRole.getRole().getRoleName() == null) {
                continue;
            }
            String roleName = userRole.getRole().getRoleName();
            for (String targetRole : targetRoles) {
                if (targetRole.equals(roleName)) {
                    return true;
                }
            }
        }
        return false;
    }
}
