package com.banking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "User_Roles")
@IdClass(UserRoleId.class) // Tells Hibernate to use our helper class for the ID
public class UserRole {

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    // 1. Machine Constructor
    public UserRole() {}

    // 2. Human Constructor
    public UserRole(User user, Role role) {
        this.user = user;
        this.role = role;
    }

    // Getters and Setters
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}