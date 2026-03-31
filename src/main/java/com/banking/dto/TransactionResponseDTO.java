package com.banking.dto;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

import com.banking.entity.Transaction;

public class TransactionResponseDTO {
    private String transactionId;
    private String senderAccountId;    // Trả về ID để khớp SQL
    private String senderAccountNumber; // Trả về Số tài khoản để người dùng dễ đọc
    private String receiverAccountId;
    private String receiverAccountNumber;
    private BigDecimal amount;
    private String transactionType;
    private String description;
    private String createdAt;           // Format lại String cho đẹp ("dd/MM/yyyy HH:mm")

    public TransactionResponseDTO() {}

    // Static Method để chuyển đổi từ Entity sang DTO một cách nhanh chóng
    public static TransactionResponseDTO fromEntity(Transaction tx) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setTransactionId(tx.getTransactionId());
        
        // Xử lý Sender (Có thể null nếu là nạp tiền)
        if (tx.getSenderAccount() != null) {
            dto.setSenderAccountId(tx.getSenderAccount().getAccountId());
            dto.setSenderAccountNumber(tx.getSenderAccount().getAccountNumber());
        }

        // Xử lý Receiver (Có thể null nếu là rút tiền)
        if (tx.getReceiverAccount() != null) {
            dto.setReceiverAccountId(tx.getReceiverAccount().getAccountId());
            dto.setReceiverAccountNumber(tx.getReceiverAccount().getAccountNumber());
        }

        dto.setAmount(tx.getAmount());
        dto.setTransactionType(tx.getTransactionType().name()); // Lấy tên Enum ('deposit', 'transfer'...)
        dto.setDescription(tx.getDescription());

        // Format thời gian từ Timestamp SQL sang định dạng thân thiện
        if (tx.getCreatedAt() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            dto.setCreatedAt(tx.getCreatedAt().format(formatter));
        }

        return dto;
    }

    // --- Getters và Setters ---
    // (Bạn nhớ sinh đầy đủ các hàm này bằng phím tắt Alt+Insert trong IntelliJ hoặc VS Code nhé)
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getSenderAccountId() { return senderAccountId; }
    public void setSenderAccountId(String senderAccountId) { this.senderAccountId = senderAccountId; }

    public String getSenderAccountNumber() { return senderAccountNumber; }
    public void setSenderAccountNumber(String senderAccountNumber) { this.senderAccountNumber = senderAccountNumber; }

    public String getReceiverAccountId() { return receiverAccountId; }
    public void setReceiverAccountId(String receiverAccountId) { this.receiverAccountId = receiverAccountId; }

    public String getReceiverAccountNumber() { return receiverAccountNumber; }
    public void setReceiverAccountNumber(String receiverAccountNumber) { this.receiverAccountNumber = receiverAccountNumber; }
}