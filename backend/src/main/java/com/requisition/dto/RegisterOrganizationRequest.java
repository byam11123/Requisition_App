package com.requisition.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterOrganizationRequest {
    private String organizationName;
    private String contactEmail;
    private String contactPhone;
    private String address;

    // Admin user details
    private String adminName;
    private String adminEmail;
    private String adminPassword;
}
