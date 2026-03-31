package com.banking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.banking.entity.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    
    // Phải là Role_name (khớp với biến role_name trong Entity)
    Optional<Role> findByRoleName(String roleName);

    // Phải là Role_name (khớp với biến role_name trong Entity)
    boolean existsByRoleName(String roleName); 
}