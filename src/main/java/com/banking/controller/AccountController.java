package com.banking.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.banking.dto.ApiResponse;
import com.banking.dto.DepositDTO;
import com.banking.dto.TransactionResponseDTO;
import com.banking.dto.TransferDTO;
import com.banking.entity.Account;
import com.banking.exception.BankingServiceException;
import com.banking.repository.AccountRepository;
import com.banking.service.AccountService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/accounts") // URL gốc là: localhost:8082/api/accounts
public class AccountController {

    private final AccountService accountService;
    private final AccountRepository accountRepository; // Dùng để tìm Account từ Database

    // Constructor Injection: CHỈ tiêm Service và Repository, KHÔNG tiêm DTO
    public AccountController(AccountService accountService, AccountRepository accountRepository) {
        this.accountService = accountService;
        this.accountRepository = accountRepository;
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<TransactionResponseDTO>> deposit(@Valid @RequestBody DepositDTO depositDTO) {
        Optional<Account> accountOpt = accountRepository.findById(depositDTO.getReceiverAccountId());
        if (accountOpt.isEmpty()) {
            throw new BankingServiceException(
                    "Account not found with ID: " + depositDTO.getReceiverAccountId(),
                    "ACCOUNT_NOT_FOUND");
        }

        TransactionResponseDTO response = accountService.depositAccount(accountOpt.get(), depositDTO);
        return ResponseEntity.ok(new ApiResponse<>(200, "Deposit successful", response));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionResponseDTO>> transfer(@Valid @RequestBody TransferDTO transferDTO) {
        Account sender = accountRepository.findById(transferDTO.getSenderId())
                .orElseThrow(() -> new BankingServiceException(
                        "Sender account not found with ID: " + transferDTO.getSenderId(),
                        "ACCOUNT_NOT_FOUND"));

        Account receiver = accountRepository.findById(transferDTO.getReceiverId())
                .orElseThrow(() -> new BankingServiceException(
                        "Receiver account not found with ID: " + transferDTO.getReceiverId(),
                        "ACCOUNT_NOT_FOUND"));

        DepositDTO details = new DepositDTO();
        details.setAmount(transferDTO.getAmount());
        details.setDescription(transferDTO.getDescription());

        TransactionResponseDTO response = accountService.transferAccount(sender, receiver, details);
        return ResponseEntity.ok(new ApiResponse<>(200, "Transfer successful", response));
    }

    @PostMapping("/withdrawal")
    public ResponseEntity<ApiResponse<TransactionResponseDTO>> withdrawal(@Valid @RequestBody DepositDTO depositDTO) {
        Optional<Account> accountOpt = accountRepository.findById(depositDTO.getReceiverAccountId());
        if (accountOpt.isEmpty()) {
            throw new BankingServiceException(
                    "Account not found with ID: " + depositDTO.getReceiverAccountId(),
                    "ACCOUNT_NOT_FOUND");
        }

        TransactionResponseDTO response = accountService.withdrawalAccount(accountOpt.get(), depositDTO);
        return ResponseEntity.ok(new ApiResponse<>(200, "Withdrawal successful", response));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<TransactionResponseDTO>>> getTransactionHistory(@PathVariable String id) {
        List<TransactionResponseDTO> history = accountService.getTransactionHistory(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Transaction history fetched", history));
    }
    
}