package com.banking.entity;

import java.io.Serializable;
import java.util.Objects;

// This class represents the "Double Primary Key" (user_id + role_id)
public class UserRoleId implements Serializable {
    private String user; // Matches the field name in the Entity
    private int role;    // Matches the field name in the Entity

    public UserRoleId() {}

    // Hibernate needs equals and hashCode to compare these composite IDs
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserRoleId that = (UserRoleId) o;
        return role == that.role && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, role);
    }
}