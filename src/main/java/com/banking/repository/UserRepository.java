package com.banking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.banking.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // Find email
    Optional<User> findByEmail(String email);

    // check email whether it exists
    boolean existsByEmail(String email);

    // Tìm theo tên (firstName)
    Optional<User> findByFirstName(String firstName);

    // Hoặc tìm theo họ (lastName)
    Optional<User> findByLastName(String lastName);
}