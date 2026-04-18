package com.banking.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ErrorResponse {
    private String timestamp;
    private int status;
    private String errorCode; // Mã lỗi định danh (ví dụ: INSUFFICIENT_FUNDS)
    private String message;
    private List<String> details; // Chi tiết thêm (ví dụ: lỗi validation từng trường)

    // Default constructor
    public ErrorResponse() {
        this.timestamp = LocalDateTime.now().toString();
    }

    // Full constructor
    public ErrorResponse(int status, String errorCode, String message, List<String> details) {
        this.timestamp = LocalDateTime.now().toString();
        this.status = status;
        this.errorCode = errorCode;
        this.message = message;
        this.details = details;
    }

    // Getters
    public String getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getMessage() {
        return message;
    }

    public List<String> getDetails() {
        return details;
    }

    // Setters
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setDetails(List<String> details) {
        this.details = details;
    }

    // Optional: toString for debugging/logging
    @Override
    public String toString() {
        return "ErrorResponse{" +
                "timestamp='" + timestamp + '\'' +
                ", status=" + status +
                ", errorCode='" + errorCode + '\'' +
                ", message='" + message + '\'' +
                ", details=" + details +
                '}';
    }
}