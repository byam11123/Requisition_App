package com.requisition.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRequisitionRequest {
    private Long requisitionTypeId;
    private String siteAddress;
    private String materialDescription;
    private Integer quantity;
    private BigDecimal amount;
    private String priority; // LOW, NORMAL, HIGH, URGENT
    private String poDetails;
    private String requiredFor;
    private String vendorName;
    private String indentNo;
    private String description;
}
