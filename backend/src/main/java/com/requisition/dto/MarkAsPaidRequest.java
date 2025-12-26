package com.requisition.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarkAsPaidRequest {
    private String modeOfPayment; // CASH, NEFT, RTGS, UPI, CARD, CHEQUE, OTHER
    private String paymentDetails;
    private Long paymentPhotoId; // Optional attachment ID
}
