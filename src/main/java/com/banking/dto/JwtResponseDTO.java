package com.banking.dto;

import java.util.List;

public class JwtResponseDTO {
    private String token;
    private String type = "Bearer"; // Loại token mặc định của Spring Security
    private String id;
    private String email;
    private List<String> roles; // Trả về danh sách quyền để Frontend ẩn/hiện nút bấm

    // 1. Constructor
    public JwtResponseDTO(String accessToken, String id, String email, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.roles = roles;
    }

    // 2. Getters và Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}