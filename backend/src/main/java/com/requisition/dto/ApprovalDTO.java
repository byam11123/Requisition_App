package com.requisition.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalDTO {
    private Long id;
    private UserDTO approver;
    private String status;
    private String comment;
    private LocalDateTime actionAt;
    private Integer sequenceOrder;
}
