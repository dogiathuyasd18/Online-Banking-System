package com.banking.repository;

import com.banking.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    // FOR PROFILE: Show a list of all accounts a user owns (Checking, Savings, etc.)
    List<Account> findByUser_UserId(String userId);

    // FOR TRANSFERS: Find an account by the 10-digit account number
    Optional<Account> findByAccountNumber(String accountNumber);
    
    // FOR VALIDATION: Check if a user already has a "Savings" account
    boolean existsByUser_UserIdAndAccountType_TypeName(String userId, String typeName);
}