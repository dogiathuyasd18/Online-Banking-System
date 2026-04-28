package com.banking.notification;

import java.util.List;

import org.springframework.stereotype.Component;

import com.banking.entity.SecurityLog;
import com.banking.entity.TransactionApprovalRequest;
import com.banking.entity.User;
import com.banking.entity.UserRole;
import com.banking.repository.SecurityLogRepository;
import com.banking.repository.UserRepository;

@Component
public class StaffAdminBroadcastObserver implements ApprovalRequestObserver {
    private final UserRepository userRepository;
    private final SecurityLogRepository securityLogRepository;

    public StaffAdminBroadcastObserver(UserRepository userRepository, SecurityLogRepository securityLogRepository) {
        this.userRepository = userRepository;
        this.securityLogRepository = securityLogRepository;
    }

    @Override
    public void onRequestCreated(TransactionApprovalRequest request) {
        String action = "APPROVAL_REQUEST_CREATED:" + request.getRequestId()
                + ":" + request.getRequestType().name()
                + ":" + request.getAmount();
        notifyStaffAndAdmin(action);
    }

    @Override
    public void onRequestResolved(TransactionApprovalRequest request) {
        String action = "APPROVAL_REQUEST_RESOLVED:" + request.getRequestId()
                + ":" + request.getStatus().name();
        notifyStaffAndAdmin(action);
    }

    private void notifyStaffAndAdmin(String action) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (hasStaffOrAdminRole(user)) {
                securityLogRepository.save(new SecurityLog(user, action, "SYSTEM"));
            }
        }
    }

    private boolean hasStaffOrAdminRole(User user) {
        if (user.getUserRoles() == null) {
            return false;
        }
        for (UserRole userRole : user.getUserRoles()) {
            if (userRole.getRole() == null || userRole.getRole().getRoleName() == null) {
                continue;
            }
            String roleName = userRole.getRole().getRoleName();
            if ("ROLE_ADMIN".equals(roleName)
                    || "ROLE_MANAGER".equals(roleName)
                    || "ROLE_STAFF".equals(roleName)
                    || "ROLE_TELLER".equals(roleName)) {
                return true;
            }
        }
        return false;
    }
}
