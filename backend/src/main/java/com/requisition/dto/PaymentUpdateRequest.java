package com.requisition.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentUpdateRequest {
    private String paymentStatus; // NOT_DONE, PARTIAL, DONE
    private String utrNo;
    private String paymentMode; // Instant/UPI/Account
    private LocalDateTime paymentDate;
    private Double amount;
}
