package com.banking.dto;

import java.math.BigDecimal;

public class AccountBalanceDTO {
    private String accountNumber;
    private BigDecimal balance;
    private String accountTypeName; // Lấy tên loại tài khoản (ví dụ: "Savings", "Current")
    private String status;          // Trạng thái tài khoản (Active, Frozen,...)

    // 1. Constructor mặc định cho Jackson
    public AccountBalanceDTO() {}

    // 2. Constructor đầy đủ để mapping nhanh từ Entity trong Service
    public AccountBalanceDTO(String accountNumber, BigDecimal balance, String accountTypeName, String status) {
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.accountTypeName = accountTypeName;
        this.status = status;
    }

    // --- Getters và Setters (Chuẩn camelCase) ---

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getAccountTypeName() {
        return accountTypeName;
    }

    public void setAccountTypeName(String accountTypeName) {
        this.accountTypeName = accountTypeName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}