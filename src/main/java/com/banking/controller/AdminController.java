package com.banking.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.banking.dto.ApiResponse;
import com.banking.dto.TransactionResponseDTO;
import com.banking.dto.UserRegistrationDTO;
import com.banking.entity.Account;
import com.banking.entity.Transaction;
import com.banking.entity.User;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.banking.service.AdminService;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AdminController(
            AdminService adminService,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository) {
        this.adminService = adminService;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> registerAccount(@Valid @RequestBody UserRegistrationDTO dto) {
        User newUser = adminService.createAccount(dto, dto.getRoleId());
        
        return ResponseEntity.ok(new ApiResponse<>(
            HttpStatus.OK.value(), 
            "Tạo tài khoản thành công cho vai trò ID: " + dto.getRoleId(), 
            newUser
        ));
    }

    @GetMapping("/accounts")
    public ResponseEntity<ApiResponse<List<Account>>> getAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Lấy danh sách tài khoản thành công", accounts));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponseDTO>>> getAllTransactions() {
        List<Transaction> transactions = transactionRepository.findAllByOrderByCreatedAtDesc();
        List<TransactionResponseDTO> response = transactions.stream()
                .map(TransactionResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Lấy danh sách giao dịch của tất cả người dùng thành công", response));
    }
}
