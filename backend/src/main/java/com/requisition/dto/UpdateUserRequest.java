package com.requisition.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private String fullName;
    private String role;
    private String designation;
    private String department;
    private Boolean isActive;
}
