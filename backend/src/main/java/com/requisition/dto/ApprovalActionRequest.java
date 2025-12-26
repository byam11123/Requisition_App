package com.requisition.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalActionRequest {
    private String approvalStatus; // TO_REVIEW, HOLD, APPROVED, REJECTED, PENDING
    private String notes;
}
