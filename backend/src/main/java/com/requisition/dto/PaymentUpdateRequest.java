package com.requisition.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentUpdateRequest {
    private String paymentStatus; // NOT_DONE, PARTIAL, DONE
    private String utrNo;
    private String paymentMode; // Instant/UPI/Account
    private LocalDateTime paymentDate;
    private BigDecimal amount;
}
