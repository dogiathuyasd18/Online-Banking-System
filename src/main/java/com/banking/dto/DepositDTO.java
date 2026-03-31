package com.banking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DepositDTO {

    private String transactionId;
    private String senderAccountId;
    private String receiverAccountId;
    private BigDecimal amount;
    private String transactionType;
    private String description;
    private LocalDateTime createdAt;

    // 1. Constructor mặc định (Bắt buộc cho Jackson)
    public DepositDTO() {
    }

    // 2. Constructor đầy đủ để dùng trong code
    public DepositDTO(String receiverAccountId, BigDecimal amount, String description) {
        this.receiverAccountId = receiverAccountId;
        this.amount = amount;
        this.description = description;
        this.transactionType = "deposit";
        this.createdAt = LocalDateTime.now();
    }

    // --- 3. Getters và Setters ---

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getSenderAccountId() {
        return senderAccountId;
    }

    public void setSenderAccountId(String senderAccountId) {
        this.senderAccountId = senderAccountId;
    }

    public String getReceiverAccountId() {
        return receiverAccountId;
    }

    public void setReceiverAccountId(String receiverAccountId) {
        this.receiverAccountId = receiverAccountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}