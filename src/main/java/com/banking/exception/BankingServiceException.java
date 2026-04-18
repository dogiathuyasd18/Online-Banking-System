package com.banking.exception;

public class BankingServiceException extends RuntimeException {
    private String errorCode;
    public  BankingServiceException(String message, String errorCode){
        super(message);
        this.errorCode=errorCode;
    } 
    public String getErrorCode() {
        return errorCode;
    }
}
