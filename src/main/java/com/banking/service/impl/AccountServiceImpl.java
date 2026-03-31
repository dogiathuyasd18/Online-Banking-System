package com.banking.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.dto.DepositDTO;
import com.banking.dto.TransactionResponseDTO;
import com.banking.entity.Account;
import com.banking.entity.Transaction;
import com.banking.entity.TransactionType;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.banking.service.AccountService;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    // Constructor Injection: Spring sẽ tự động tiêm các Repository vào
    public AccountServiceImpl(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    @Transactional // Đảm bảo: Hoặc cả 2 cùng thành công, hoặc không gì cả (Rollback)
    public TransactionResponseDTO depositAccount(Account account, DepositDTO depositDTO) {

        // 1. CẬP NHẬT SỐ DƯ TÀI KHOẢN (BƯỚC QUAN TRỌNG NHẤT)
        BigDecimal amountToDeposit = depositDTO.getAmount();

        // Tuyệt đối dùng .add() của BigDecimal, không dùng dấu +
        BigDecimal newBalance = account.getBalance().add(amountToDeposit);
        account.setBalance(newBalance);

        // Lưu lại tài khoản với số dư mới vào DB
        accountRepository.save(account);

        // 2. TẠO THỰC THỂ GIAO DỊCH (ENTITY)
        Transaction depositTx = new Transaction();
        depositTx.setTransactionId(UUID.randomUUID().toString());

        // Với Deposit: Người gửi (Sender) là NULL vì tiền từ bên ngoài hệ thống vào
        depositTx.setSenderAccount(null);

        // Người nhận (Receiver) chính là tài khoản đang thao tác
        depositTx.setReceiverAccount(account);

        depositTx.setAmount(amountToDeposit);
        depositTx.setDescription(depositDTO.getDescription());

        // Gán Enum: lấy từ chuỗi "deposit" trong DTO hoặc dùng trực tiếp Enum
        depositTx.setTransactionType(TransactionType.deposit);

        // 3. LƯU GIAO DỊCH VÀO DATABASE
        Transaction savedTx = transactionRepository.save(depositTx);

        // 4. CHUYỂN ĐỔI SANG DTO VÀ TRẢ VỀ CHO CONTROLLER
        return TransactionResponseDTO.fromEntity(savedTx);
    }

    @Override
    @Transactional
    public TransactionResponseDTO transferAccount(Account sendAccountDTO, Account recieveAccountDTO,
            DepositDTO depositDTO) {
        if (sendAccountDTO.getBalance().compareTo(depositDTO.getAmount()) < 0) {
            throw new RuntimeException("Số dư không đủ để thực hiện chuyển khoản!");
        }
        if (sendAccountDTO.getAccountId().equals(recieveAccountDTO.getAccountId())) {
            throw new RuntimeException("Không thể chuyển tiền cho chính mình!");
        }

        Transaction transaction = new Transaction();
        transaction.setTransactionId(UUID.randomUUID().toString());
        transaction.setSenderAccount(sendAccountDTO);
        transaction.setReceiverAccount(recieveAccountDTO);
        transaction.setAmount(depositDTO.getAmount());
        transaction.setTransactionType(TransactionType.transfer);
        transaction.setDescription(depositDTO.getDescription());
        sendAccountDTO.setBalance(sendAccountDTO.getBalance().subtract(depositDTO.getAmount()));
        recieveAccountDTO.setBalance(recieveAccountDTO.getBalance().add(depositDTO.getAmount()));
        transaction.setCreatedAt(LocalDateTime.now());
        accountRepository.save(sendAccountDTO);
        accountRepository.save(recieveAccountDTO);
        transactionRepository.save(transaction);
        return TransactionResponseDTO.fromEntity(transaction);

    }

    @Override
    @Transactional // Đảm bảo: Hoặc cả 2 cùng thành công, hoặc không gì cả (Rollback)
    public TransactionResponseDTO withdrawalAccount(Account account, DepositDTO depositDTO) {

        // 1. CẬP NHẬT SỐ DƯ TÀI KHOẢN (BƯỚC QUAN TRỌNG NHẤT)
        BigDecimal amountToDeposit = depositDTO.getAmount();

        // Tuyệt đối dùng .add() của BigDecimal, không dùng dấu +
        BigDecimal newBalance = account.getBalance().subtract(amountToDeposit);
        account.setBalance(newBalance);

        // Lưu lại tài khoản với số dư mới vào DB
        accountRepository.save(account);

        // 2. TẠO THỰC THỂ GIAO DỊCH (ENTITY)
        Transaction depositTx = new Transaction();
        depositTx.setTransactionId(UUID.randomUUID().toString());

        // Với Deposit: Người gửi (Sender) là NULL vì tiền từ bên ngoài hệ thống vào
        depositTx.setSenderAccount(null);

        // Người nhận (Receiver) chính là tài khoản đang thao tác
        depositTx.setReceiverAccount(account);

        depositTx.setAmount(amountToDeposit);
        depositTx.setDescription(depositDTO.getDescription());

        // Gán Enum: lấy từ chuỗi "deposit" trong DTO hoặc dùng trực tiếp Enum
        depositTx.setTransactionType(TransactionType.withdrawal);

        // 3. LƯU GIAO DỊCH VÀO DATABASE
        Transaction savedTx = transactionRepository.save(depositTx);

        // 4. CHUYỂN ĐỔI SANG DTO VÀ TRẢ VỀ CHO CONTROLLER
        return TransactionResponseDTO.fromEntity(savedTx);
    }

    @Override
    public List<TransactionResponseDTO> getTransactionHistory(String accountId) {
        // Không cần dùng: new ArrayList<Transaction>()
        // Chỉ cần gọi Repository, nó sẽ tự trả về một List xịn
        List<Transaction> transactions = transactionRepository.findAllHistoryByAccountId(accountId);

        // Sau đó map sang DTO
        return transactions.stream()
                .map(TransactionResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}