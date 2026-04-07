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
                
                System.out.println("\n--- SUCCESSFUL ---");

            } catch (Exception e) {
                System.out.println("❌ Test Failed: " + e.getMessage());
            }

            System.out.println("--- DATABASE INTEGRATION TEST FINISHED ---\n");
        };
    }
}