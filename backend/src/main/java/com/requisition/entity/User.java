package com.requisition.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private UserRole role; // ADMIN, PURCHASER, MANAGER, ACCOUNTANT

    private String department;
    private String designation; // Job title (e.g., "Senior Purchaser", "Finance Manager")

    private boolean isActive = true;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum UserRole {
        ADMIN, // Can manage users, assign roles, view all data in organization
        PURCHASER, // Create requisitions, dispatch goods
        MANAGER, // Approve requisitions
        ACCOUNTANT // Mark as paid
    }
}
