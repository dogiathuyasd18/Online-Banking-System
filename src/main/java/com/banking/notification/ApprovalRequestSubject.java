package com.banking.notification;

import com.banking.entity.TransactionApprovalRequest;

public interface ApprovalRequestSubject {
    void registerObserver(ApprovalRequestObserver observer);

    void removeObserver(ApprovalRequestObserver observer);

    void notifyRequestCreated(TransactionApprovalRequest request);

    void notifyRequestResolved(TransactionApprovalRequest request);
}
