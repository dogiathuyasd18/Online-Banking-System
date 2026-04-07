package com.banking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.banking.entity.UserRole;
import com.banking.entity.UserRoleId;

@Repository // 🚀 Đánh dấu để Spring Boot nhận diện đây là một Bean quản lý Database
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    /**
     * Tìm tất cả các bản ghi quyền hạn của một User cụ thể.
     * Hibernate sẽ tự động thực hiện JOIN sang bảng users dựa trên userId.
     */
    List<UserRole> findByUser_UserId(String userId);

    /**
     * Kiểm tra xem một User đã có một Role cụ thể chưa.
     */
    boolean existsByUser_UserIdAndRole_RoleId(String userId, int roleId);
}