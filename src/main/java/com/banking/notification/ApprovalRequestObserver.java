package com.banking.notification;

import com.banking.entity.TransactionApprovalRequest;

public interface ApprovalRequestObserver {
    void onRequestCreated(TransactionApprovalRequest request);

    void onRequestResolved(TransactionApprovalRequest request);
}
