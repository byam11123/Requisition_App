package com.requisition.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterialReceiptRequest {
    private Boolean materialReceived;
    private String receiptNotes;
}
