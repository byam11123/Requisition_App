package com.requisition.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionDetailDTO {
    private Long id;
    private String requestId;
    private String type;
    private String status;
    private String approvalStatus;
    private String paymentStatus;
    private String dispatchStatus;
    private String priority;

    // Core fields
    private String description;
    private String siteAddress;
    private String materialDescription;
    private Integer quantity;
    private BigDecimal amount;

    // Purchase details
    private String poDetails;
    private String requiredFor;
    private String vendorName;
    private String indentNo;

    // Payment
    private String modeOfPayment;
    private String paymentDetails;

    // User
    private UserDTO createdBy;
    private UserDTO dispatchedBy;
    private String createdByName;
    private String approvedByName;
    private String paidByName;
    private String dispatchedByName;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime paidAt;
    private LocalDateTime dispatchedAt;

    // Attachments grouped by category
    private List<AttachmentDTO> itemPhotos;
    private List<AttachmentDTO> billPhotos;
    private List<AttachmentDTO> paymentPhotos;

    // Approvals
    private List<ApprovalDTO> approvals;
}
