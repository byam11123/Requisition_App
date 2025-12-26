package com.requisition.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "requisition_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;
    private LocalDateTime createdAt = LocalDateTime.now();
}
