package com.banking.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.dto.AccountBalanceDTO;
import com.banking.dto.UserLoginDTO;
import com.banking.dto.UserRegistrationDTO;
import com.banking.dto.UserResponseDTO;
import com.banking.entity.Account;
import com.banking.entity.AccountStatus;
import com.banking.entity.AccountType;
import com.banking.entity.Credential;
import com.banking.entity.User;
import com.banking.repository.AccountRepository;
import com.banking.repository.CredentialRepository;
import com.banking.repository.RoleRepository;
import com.banking.repository.UserRepository;
import com.banking.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CredentialRepository credentialRepository;
    private AccountRepository accountRepository = null;

    public UserServiceImpl(UserRepository userRepository,
            RoleRepository roleRepository,
            CredentialRepository credentialRepository,
            AccountRepository accountRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.credentialRepository = credentialRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    @Transactional
    public User registerUser(UserRegistrationDTO dto) {

        // 1. Kiểm tra email
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // 2. Tạo User mới
        User user = new User();
        String newUserId = UUID.randomUUID().toString();
        user.setUserId(newUserId);
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        // user.setPhone(dto.getPhone());

        // 3. Lưu User
        User savedUser = userRepository.save(user);

        // --- ĐOẠN CẦN SỬA Ở ĐÂY ---
        Credential credential = new Credential();

        // THAY VÌ: credential.setUserId(newUserId); ❌
        // HÃY DÙNG:
        credential.setUser(savedUser); // ✅ Gán cả đối tượng User vừa lưu vào đây

        credential.setPasswordHash(dto.getPassword());
        credentialRepository.save(credential);
        // --------------------------


        // 4. Tạo Account
        Account savedAccount = new Account();
        savedAccount.setAccountId(UUID.randomUUID().toString());
        savedAccount.setUser(savedUser);
        AccountType type = new AccountType();
        type.setTypeId(1);
        savedAccount.setAccountType(type);
        String randomAccNum = "VNB" + (100000000 + new Random().nextInt(900000000));
        savedAccount.setAccountNumber(randomAccNum);
        savedAccount.setStatus(AccountStatus.active);
        accountRepository.save(savedAccount);
        return savedUser;
    }

    public UserResponseDTO loginUser(UserLoginDTO loginDTO) {
        // 1. Tìm User - Nếu không thấy thì "đuổi khách" ngay lập tức
        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Sai email hoặc mật khẩu!"));
    
        // 2. Kiểm tra mật khẩu - Nếu sai cũng "đuổi khách" luôn
        // Dùng !...equals(...) để xử lý trường hợp sai trước (Fail-fast)
        if (!user.getCredential().getPasswordHash().equals(loginDTO.getPassword())) {
            throw new RuntimeException("Sai email hoặc mật khẩu!");
        }
    
        // 3. Cập nhật thời gian đăng nhập (Login thành công mới chạy đến đây)
        Credential credential = user.getCredential();
        credential.setLastLogin(LocalDateTime.now());
        credentialRepository.save(credential);
    
        // 4. Lấy danh sách tài khoản - PHẢI DÙNG user.getUserId()
        // Lỗi cũ của bạn là dùng loginDTO.getEmail() ở đây
        List<Account> userAccounts = accountRepository.findByUser_UserId(user.getUserId());
    
        // 5. Chuyển đổi sang danh sách DTO (Mapping)
        List<AccountBalanceDTO> accountDTOs = userAccounts.stream()
                .map(acc -> new AccountBalanceDTO(
                        acc.getAccountNumber(),
                        acc.getBalance(),
                        acc.getAccountType().getTypeName(), // Đảm bảo AccountType có getTypeName()
                        acc.getStatus().name()))
                .toList();
    
        // 6. Trả về kết quả tổng hợp "xịn xò" cho Frontend
        return new UserResponseDTO(
                user.getFirstName(), 
                user.getLastName(), 
                user.getEmail(), 
                accountDTOs
        );
    }
}