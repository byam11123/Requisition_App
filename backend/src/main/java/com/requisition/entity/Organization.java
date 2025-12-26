package com.requisition.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "organizations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String contactEmail;

    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private boolean isActive = true;

    private String subscriptionPlan = "FREE"; // FREE, BASIC, PREMIUM

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    private List<User> users;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    private List<Requisition> requisitions;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
