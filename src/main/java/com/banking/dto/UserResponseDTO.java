package com.banking.dto;

import java.util.List;

public class UserResponseDTO {
    private String firstName;
    private String lastName;
    private String email;
    private List<AccountBalanceDTO> accounts; // Danh sách các tài khoản của người dùng

    // 1. Constructor mặc định (Bắt buộc phải có để Jackson làm việc)
    public UserResponseDTO() {
    }

    // 2. Constructor đầy đủ tham số (Dùng để tạo nhanh đối tượng ở Service)
    public UserResponseDTO(String firstName, String lastName, String email, List<AccountBalanceDTO> accounts) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.accounts = accounts;
    }

    // --- 3. Getters và Setters (Phải tuân thủ quy tắc camelCase) ---

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<AccountBalanceDTO> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<AccountBalanceDTO> accounts) {
        this.accounts = accounts;
    }
}