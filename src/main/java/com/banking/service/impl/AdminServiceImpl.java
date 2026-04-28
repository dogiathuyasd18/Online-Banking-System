package com.banking.service.impl;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.banking.dto.UserRegistrationDTO;
import com.banking.entity.Credential;
import com.banking.entity.Role;
import com.banking.entity.User;
import com.banking.entity.UserRole;
import com.banking.repository.CredentialRepository;
import com.banking.repository.RoleRepository;
import com.banking.repository.UserRepository;
import com.banking.repository.UserRoleRepository;
import com.banking.exception.BankingServiceException;
import com.banking.service.AdminService;

import jakarta.transaction.Transactional;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final CredentialRepository credentialRepository;
    private final RoleRepository roleRepository;

    public AdminServiceImpl(UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            CredentialRepository credentialRepository,
            RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.credentialRepository = credentialRepository;
        this.roleRepository = roleRepository;
    }

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User createAccount(UserRegistrationDTO userRegistrationDTO, int role) {
        if (userRepository.existsByEmail(userRegistrationDTO.getEmail())) {
            throw new BankingServiceException("Email đã tồn tại trong hệ thống", "EMAIL_ALREADY_EXISTS");
        }

        // 1. Tạo User (Thực thể CHA)
        User user = new User();
        String newId = UUID.randomUUID().toString();
        user.setUserId(newId);
        user.setFirstName(userRegistrationDTO.getFirstName());
        user.setLastName(userRegistrationDTO.getLastName());
        user.setEmail(userRegistrationDTO.getEmail());

        // LƯU USER TRƯỚC ĐỂ "CHỐT" ID
        User savedUser = userRepository.save(user);

        // 2. Tạo Credential (Thực thể CON)
        Credential credential = new Credential();
        credential.setPasswordHash(passwordEncoder.encode(userRegistrationDTO.getPassword()));

        // CHỈ GÁN ĐỐI TƯỢNG, KHÔNG GÁN ID THỦ CÔNG
        // @MapsId sẽ tự động lấy ID từ savedUser để đưa vào Credential
        credential.setUser(savedUser);

        // 3. Tạo UserRole
        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        Role roleObj = roleRepository.findById(role)
                .orElseThrow(() -> new BankingServiceException(
                        "Không tìm thấy vai trò với ID: " + role,
                        "ROLE_NOT_FOUND"));
        userRole.setRole(roleObj);

        // 4. LƯU CÁC THÀNH PHẦN CÒN LẠI
        userRoleRepository.save(userRole);
        credentialRepository.save(credential); // Lúc này ID của Credential sẽ không còn null
        return savedUser;
    }
}
