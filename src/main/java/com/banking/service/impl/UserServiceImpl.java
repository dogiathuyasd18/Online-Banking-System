package com.banking.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.dto.AccountBalanceDTO;
import com.banking.dto.JwtResponseDTO;
import com.banking.dto.UserLoginDTO;
import com.banking.dto.UserRegistrationDTO;
import com.banking.dto.UserResponseDTO;
import com.banking.entity.Account;
import com.banking.entity.AccountStatus;
import com.banking.entity.AccountType;
import com.banking.entity.Credential;
import com.banking.entity.Role;
import com.banking.entity.User;
import com.banking.entity.UserRole;
import com.banking.repository.AccountRepository;
import com.banking.repository.CredentialRepository;
import com.banking.repository.RoleRepository;
import com.banking.repository.UserRepository;
import com.banking.repository.UserRoleRepository;
import com.banking.security.JwtUtils;
import com.banking.security.UserDetailsImpl;
import com.banking.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CredentialRepository credentialRepository;
    private AccountRepository accountRepository = null;
    private UserRoleRepository userRoleRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
            RoleRepository roleRepository,
            CredentialRepository credentialRepository,
            AccountRepository accountRepository, UserRoleRepository userRoleRepository,
            @Lazy AuthenticationManager authenticationManager, JwtUtils jwtUtils,PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.credentialRepository = credentialRepository;
        this.accountRepository = accountRepository;
        this.userRoleRepository = userRoleRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
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

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        credential.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
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

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        Role role = new Role();
        role.setRoleId(1);
        userRole.setRole(role);
        userRoleRepository.save(userRole);
        return savedUser;
    }

    public UserResponseDTO loginUser(UserLoginDTO loginDTO) {
        // 1. Tìm User - Nếu không thấy thì "đuổi khách" ngay lập tức
        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Sai email"));

        // 2. Kiểm tra mật khẩu - Nếu sai cũng "đuổi khách" luôn
        // Dùng !...equals(...) để xử lý trường hợp sai trước (Fail-fast)
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getCredential().getPasswordHash())) {
            throw new RuntimeException("Sai mật khẩu!");
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
                accountDTOs);
    }

    @Override
    public JwtResponseDTO authenticateUser(UserLoginDTO loginDTO) {
        try {
            // 🎯 ĐÂY LÀ CHỖ CẦN DEBUG:
            // Nếu sai pass hoặc email, nó sẽ nhảy xuống catch ngay
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = jwtUtils.generateJwtToken(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            return new JwtResponseDTO(jwt, userDetails.getId(), userDetails.getEmail(), roles);
        } catch (Exception e) {
            // 🕵️‍♂️ Cách debug nhanh nhất: In lỗi ra console
            System.out.println("LỖI LOGIN RỒI: " + e.getMessage());
            throw new RuntimeException("Xác thực thất bại: " + e.getMessage());
        }
    }
}