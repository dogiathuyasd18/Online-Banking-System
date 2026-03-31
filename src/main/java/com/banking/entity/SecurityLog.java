package com.banking.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Security_Logs")
public class SecurityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private long logId; // Use long for bigint

    @ManyToOne
    @JoinColumn(name = "user_id") // The Foreign Key from your SQL
    private User user;

    @Column(name = "action", length = 255)
    private String action;

    @Column(name = "ip_address", length = 45) // Length 45 handles IPv6 addresses
    private String ipAddress;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 1. The "Machine" Constructor (Empty Plate)
    public SecurityLog() {}

    // 2. The "Human" Constructor (Pre-assembled)
    public SecurityLog(User user, String action, String ipAddress) {
        this.user = user;
        this.action = action;
        this.ipAddress = ipAddress;
        this.createdAt = LocalDateTime.now(); // Set time when log is created
    }

    // Getters and Setters
    public long getLogId() { return logId; }
    public void setLogId(long logId) { this.logId = logId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}