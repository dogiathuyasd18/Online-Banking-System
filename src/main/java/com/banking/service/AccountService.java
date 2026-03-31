package com.banking.service;

import java.util.List;

import com.banking.dto.DepositDTO;
import com.banking.dto.TransactionResponseDTO;
import com.banking.entity.Account;

public interface AccountService {
    // Account getAccountBalance(AccountBalanceDTO accountBalanceDTO);

    TransactionResponseDTO depositAccount(Account accountDTO,DepositDTO depositDTO);

    TransactionResponseDTO transferAccount(Account sendAccountDTO, Account recieveAccountDTO, DepositDTO depositDTO);

    TransactionResponseDTO withdrawalAccount(Account accountDTO,DepositDTO depositDTO);

    List<TransactionResponseDTO> getTransactionHistory(String accountId);
}
