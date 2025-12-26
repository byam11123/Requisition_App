package com.requisition.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionCardDTO {
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
    private String cardSubtitleInfo;
    private String createdByName;
    private LocalDateTime createdAt;
    private String itemPhotoUrl; // First item photo
    private String siteAddress;
    private String vendorName;
}
