package com.banking.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TransferDTO {

    @NotBlank(message = "ID người gửi không được để trống")
    private String senderId;

    @NotBlank(message = "ID người nhận không được để trống")
    private String receiverId;

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "0.01", message = "Số tiền chuyển tối thiểu phải là 0.01")
    private BigDecimal amount;

    private String description;

    // 1. Constructor không tham số (Bắt buộc để Spring có thể map JSON)
    public TransferDTO() {
    }

    // 2. Constructor đầy đủ tham số (Tiện cho việc viết Unit Test sau này)
    public TransferDTO(String senderId, String receiverId, BigDecimal amount, String description) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.amount = amount;
        this.description = description;
    }

    // 3. Getters và Setters
    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
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
}