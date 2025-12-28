package com.requisition.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDTO {
    private Long id;
    private String name;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String subscriptionPlan;
    private String logoUrl;
    private boolean isActive;
    private LocalDateTime createdAt;
    private Integer totalUsers;
    private Integer totalRequisitions;
}
