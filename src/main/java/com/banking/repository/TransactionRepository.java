package com.banking.repository;

import com.banking.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    // FOR HISTORY: Find every transaction where this account was EITHER the sender OR the receiver
    @Query("SELECT t FROM Transaction t WHERE t.senderAccount.accountId = :id OR t.receiverAccount.accountId = :id ORDER BY t.createdAt DESC")
    List<Transaction> findAllHistoryByAccountId(@Param("id") String accountId);

    // FOR FRAUD DETECTION: Find large transactions (e.g., over $10,000)
    // List<Transaction> findByAmountGreaterThan(BigDecimal amount);
}