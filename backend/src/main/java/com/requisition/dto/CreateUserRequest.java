package com.requisition.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    private String email;
    private String fullName;
    private String password;
    private String role; // ADMIN, PURCHASER, MANAGER, ACCOUNTANT
    private String designation;
    private String department;
}
