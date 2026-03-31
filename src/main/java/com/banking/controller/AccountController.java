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

import com.banking.dto.DepositDTO;
import com.banking.dto.TransactionResponseDTO;
import com.banking.dto.TransferDTO;
import com.banking.entity.Account;
import com.banking.repository.AccountRepository;
import com.banking.service.AccountService;

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
    public ResponseEntity<?> deposit(@RequestBody DepositDTO depositDTO) {
        try {
            // 1. Tìm tài khoản dựa trên ID người nhận gửi lên từ Postman
            Optional<Account> accountOpt = accountRepository.findById(depositDTO.getReceiverAccountId());

            if (accountOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Lỗi: Không tìm thấy tài khoản với ID: " + depositDTO.getReceiverAccountId());
            }

            // 2. Gọi Service để thực hiện nghiệp vụ nạp tiền và lưu Transaction
            TransactionResponseDTO response = accountService.depositAccount(accountOpt.get(), depositDTO);

            // 3. Trả về kết quả "biên lai" xinh xắn cho Frontend
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Trả về lỗi nếu có vấn đề (Ví dụ: số tiền âm, lỗi DB...)
            return ResponseEntity.internalServerError().body("Có lỗi xảy ra: " + e.getMessage());
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody TransferDTO transferDTO) {
        try {
            // 1. Tìm tài khoản người gửi
            Account sender = accountRepository.findById(transferDTO.getSenderId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy người gửi với ID: " + transferDTO.getSenderId()));

            // 2. Tìm tài khoản người nhận
            Account receiver = accountRepository.findById(transferDTO.getReceiverId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy người nhận với ID: " + transferDTO.getReceiverId()));

            // 3. Chuẩn bị DTO để truyền vào Service (Tận dụng lại DepositDTO của bạn hoặc
            // tạo mới)
            DepositDTO details = new DepositDTO();
            details.setAmount(transferDTO.getAmount());
            details.setDescription(transferDTO.getDescription());

            // 4. Gọi Service thực hiện "phép màu" chuyển tiền
            TransactionResponseDTO response = accountService.transferAccount(sender, receiver, details);

            // 5. Trả về kết quả thành công
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // Trả về lỗi 400 nếu không đủ tiền hoặc không tìm thấy tài khoản
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Trả về lỗi 500 nếu có sự cố hệ thống
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    @PostMapping("/withdrawal")
    public ResponseEntity<?> withdrawal(@RequestBody DepositDTO depositDTO) {
        try {
            // 1. Tìm tài khoản dựa trên ID người nhận gửi lên từ Postman
            Optional<Account> accountOpt = accountRepository.findById(depositDTO.getReceiverAccountId());

            if (accountOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Lỗi: Không tìm thấy tài khoản với ID: " + depositDTO.getReceiverAccountId());
            }

            // 2. Gọi Service để thực hiện nghiệp vụ nạp tiền và lưu Transaction
            TransactionResponseDTO response = accountService.withdrawalAccount(accountOpt.get(), depositDTO);

            // 3. Trả về kết quả "biên lai" xinh xắn cho Frontend
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Trả về lỗi nếu có vấn đề (Ví dụ: số tiền âm, lỗi DB...)
            return ResponseEntity.internalServerError().body("Có lỗi xảy ra: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getTransactionHistory(@PathVariable String id) {
        try {
            // 1. Gọi Service để lấy danh sách DTO đã được map sẵn
            List<TransactionResponseDTO> history = accountService.getTransactionHistory(id);

            // 2. Trả về danh sách kèm HTTP 200 OK
            // Nếu danh sách trống, người dùng sẽ nhận được mảng rỗng [] - rất chuẩn REST
            return ResponseEntity.ok(history);

        } catch (RuntimeException e) {
            // Trả về 400 nếu ID tài khoản không tồn tại
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Trả về 500 nếu có lỗi hệ thống (DB, Network...)
            return ResponseEntity.internalServerError().body("Lỗi khi tải lịch sử: " + e.getMessage());
        }
    }
    
}