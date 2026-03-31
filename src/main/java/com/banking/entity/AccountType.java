package com.banking.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column; // Import this for financial precision
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Account_Types")
public class AccountType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "type_id")
    private int typeId;

    @Column(name = "type_name", length = 50, nullable = false)
    private String typeName;

    // Fixed: Use BigDecimal to match decimal(5,4)
    @Column(name = "interest_rate", precision = 5, scale = 4)
    private BigDecimal interestRate;

    // 1. "Machine" Constructor
    public AccountType() {}

    // 2. "Human" Constructor
    public AccountType(String typeName, BigDecimal interestRate) {
        this.typeName = typeName;
        this.interestRate = interestRate;
    }

    // Getters and Setters...
    public int getTypeId() { return typeId; }
    public void setTypeId(int typeId) { this.typeId = typeId; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }

    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }
}