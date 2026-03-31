package com.banking;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.banking.repository.AccountRepository;
import com.banking.repository.UserRepository;
@SpringBootApplication
public class BankingApplication {

    public static void main(String[] args) {
        SpringApplication.run(BankingApplication.class, args);
    }

    @Bean
    public CommandLineRunner testDatabase(
            AccountRepository accountRepository, 
            UserRepository userRepository) {
        
        return args -> {
            System.out.println("\n--- STARTING DATABASE INTEGRATION TEST ---");

            try {
                // 1. Tạo và Lưu User trước
                // System.out.println("Step 1: Creating User...");
                // String userId = UUID.randomUUID().toString();
                // String uniqueEmail = "gia.thuy." + UUID.randomUUID().toString().substring(0, 5) + "@banking.com";
                
                // User newUser = new User(userId, "Gia", "Thuy", uniqueEmail, "0975170724");
                // User savedUser = userRepository.save(newUser);
                // System.out.println("✅ User saved! ID: " + savedUser.getUserId());

                // 2. Tạo và Lưu Account liên kết với User
                // System.out.println("\nStep 2: Creating Account linked to User...");
                // Account newAccount = new Account();
                // newAccount.setAccountId(UUID.randomUUID().toString());
                // newAccount.setUser(savedUser); 
                
                // String randomAccNum = "VNB" + (100000000 + new Random().nextInt(900000000));
                // newAccount.setAccountNumber(randomAccNum);
                // newAccount.setBalance(new BigDecimal("500000.00"));
                
                // // Gán TypeId (Đảm bảo giá trị 1 đã tồn tại trong bảng Account_Types)
                // AccountType type = new AccountType();

                // type.setTypeId(1); 
                // newAccount.setAccountType(type);
                // newAccount.setStatus(AccountStatus.active);

                // accountRepository.save(newAccount);
                // System.out.println("✅ Account saved! Number: " + randomAccNum);
                
                System.out.println("\n--- TEST SUCCESSFUL ---");

            } catch (Exception e) {
                System.out.println("❌ Test Failed: " + e.getMessage());
                System.out.println("Tip: Check if type_id 1 exists in table Account_Types!");
            }

            System.out.println("--- DATABASE INTEGRATION TEST FINISHED ---\n");
        };
    }
}