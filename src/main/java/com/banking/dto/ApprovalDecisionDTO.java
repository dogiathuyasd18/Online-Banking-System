package com.banking.dto;

import jakarta.validation.constraints.NotBlank;

public class ApprovalDecisionDTO {
    @NotBlank(message = "Decision is required")
    private String decision;

    private String note;

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
