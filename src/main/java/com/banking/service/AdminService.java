package com.banking.service;

import com.banking.dto.UserRegistrationDTO;
import com.banking.entity.User;

public interface AdminService {
    User createAccount(UserRegistrationDTO userRegistrationDTO, int role);
}
