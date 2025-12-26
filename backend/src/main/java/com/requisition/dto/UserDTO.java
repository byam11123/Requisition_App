package com.requisition.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private String designation;
    private String department;
    private Long organizationId;
    private String organizationName;
}
