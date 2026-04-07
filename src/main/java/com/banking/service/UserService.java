package com.banking.service;

import com.banking.dto.JwtResponseDTO;
import com.banking.dto.UserLoginDTO;
import com.banking.dto.UserRegistrationDTO;
import com.banking.dto.UserResponseDTO;
import com.banking.entity.User;

public interface UserService {
    User registerUser(UserRegistrationDTO registrationDto);
    
    UserResponseDTO loginUser(UserLoginDTO loginDTO);
    // Optional<User> getUserByEmail(String email);
    // List<User> getAllUser();

    // void upDatePassWord(String userId, String password);
    // void updateMfaStatus(String userId, boolean status);

    JwtResponseDTO authenticateUser(UserLoginDTO loginDTO);
}
