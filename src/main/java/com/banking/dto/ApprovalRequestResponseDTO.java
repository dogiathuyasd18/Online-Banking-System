package com.banking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.banking.entity.TransactionApprovalRequest;

public class ApprovalRequestResponseDTO {
    private String requestId;
    private String accountId;
    private String requestedByEmail;
    private String processedByEmail;
    private String requestType;
    private String status;
    private BigDecimal amount;
    private String description;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;

    public static ApprovalRequestResponseDTO fromEntity(TransactionApprovalRequest request) {
        ApprovalRequestResponseDTO dto = new ApprovalRequestResponseDTO();
        dto.setRequestId(request.getRequestId());
        dto.setAccountId(request.getAccount().getAccountId());
        dto.setRequestedByEmail(request.getRequestedBy().getEmail());
        dto.setProcessedByEmail(request.getProcessedBy() != null ? request.getProcessedBy().getEmail() : null);
        dto.setRequestType(request.getRequestType().name());
        dto.setStatus(request.getStatus().name());
        dto.setAmount(request.getAmount());
        dto.setDescription(request.getDescription());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setProcessedAt(request.getProcessedAt());
        return dto;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getRequestedByEmail() {
        return requestedByEmail;
    }

    public void setRequestedByEmail(String requestedByEmail) {
        this.requestedByEmail = requestedByEmail;
    }

    public String getProcessedByEmail() {
        return processedByEmail;
    }

    public void setProcessedByEmail(String processedByEmail) {
        this.processedByEmail = processedByEmail;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
}
