package com.banking.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Credentials")

public class Credential {
    @Id
    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "mfa_enabled")
    private boolean mfaEnabled;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    // 1. THE "MACHINE" CONSTRUCTOR (Empty Plate)
    public Credential() {
    }

    // 2. THE "HUMAN" CONSTRUCTOR (Pre-assembled)
    public Credential(String userId, String passwordHash) {
        this.userId = userId;
        this.passwordHash = passwordHash;
        this.mfaEnabled = false; // Set a default value
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isMfaEnabled() {
        return mfaEnabled;
    }

    public void setMfaEnabled(boolean mfaEnabled) {
        this.mfaEnabled = mfaEnabled;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
