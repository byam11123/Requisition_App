package com.requisition.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionDTO {
    private Long id;
    private String requestId;
    private String type;
    private String description;
    private Double amount;
    private String status;
    private String approvalStatus;
    private String paymentStatus;
    private String dispatchStatus;
    private String priority;
    private String siteAddress;
    private String materialDescription;
    private Integer quantity;
    private String poDetails;
    private String requiredFor;
    private String vendorName;
    private String indentNo;

    // New fields
    private String paymentUtrNo;
    private String paymentMode;
    private LocalDateTime paymentDate;
    private Double paymentAmount;
    private String paymentPhotoUrl;
    private String materialPhotoUrl;
    private String billPhotoUrl;
    private String approvalNotes;
    private Boolean materialReceived;
    private String receiptNotes;

    private String data;
    private UserDTO createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime paidAt;
    private LocalDateTime dispatchedAt;
}
