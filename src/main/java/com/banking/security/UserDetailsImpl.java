package com.banking.security;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.banking.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private String id;
    private String email;

    @JsonIgnore // 🛡️ Bảo mật: Không bao giờ để lộ mật khẩu khi trả về JSON
    private String password;

    // Danh sách quyền hạn (Roles) của User
    private Collection<? extends GrantedAuthority> authorities;

    // 1. Constructor
    public UserDetailsImpl(String id, String email, String password,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    // 🚀 2. HÀM QUAN TRỌNG NHẤT: Chuyển từ User Entity sang UserDetailsImpl
    public static UserDetailsImpl build(User user) {
        // 1. Duyệt qua danh sách UserRole -> Lấy Role -> Lấy tên Role
        List<GrantedAuthority> authorities = user.getUserRoles().stream()
                .map(userRole -> {
                    String roleName = userRole.getRole().getRoleName(); 
                    return new SimpleGrantedAuthority(roleName);
                })
                .collect(Collectors.toList());
    
        return new UserDetailsImpl(
                user.getUserId(),        // ID kiểu String (UUID)
                user.getEmail(),         // Email
                user.getCredential().getPasswordHash(), // Password từ bảng Credential
                authorities);
    }

    // --- Override các phương thức bắt buộc của Interface UserDetails ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // Spring dùng hàm này làm định danh (thường là email hoặc username)
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Tài khoản không bao giờ hết hạn
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Tài khoản không bị khóa
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Mật khẩu không bao giờ hết hạn
    }

    @Override
    public boolean isEnabled() {
        return true; // Tài khoản luôn hoạt động
    }

    // --- Các Getters bổ sung để dùng trong Controller sau này ---

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    // --- Override equals & hashCode để so sánh User chính xác ---
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}