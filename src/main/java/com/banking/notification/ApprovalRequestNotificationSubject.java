package com.banking.notification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.banking.entity.TransactionApprovalRequest;

@Component
public class ApprovalRequestNotificationSubject implements ApprovalRequestSubject {
    private final List<ApprovalRequestObserver> observers = new ArrayList<>();

    public ApprovalRequestNotificationSubject(List<ApprovalRequestObserver> observers) {
        this.observers.addAll(observers);
    }

    @Override
    public void registerObserver(ApprovalRequestObserver observer) {
        this.observers.add(observer);
    }

    @Override
    public void removeObserver(ApprovalRequestObserver observer) {
        this.observers.remove(observer);
    }

    @Override
    public void notifyRequestCreated(TransactionApprovalRequest request) {
        for (ApprovalRequestObserver observer : observers) {
            observer.onRequestCreated(request);
        }
    }

    @Override
    public void notifyRequestResolved(TransactionApprovalRequest request) {
        for (ApprovalRequestObserver observer : observers) {
            observer.onRequestResolved(request);
        }
    }
}
