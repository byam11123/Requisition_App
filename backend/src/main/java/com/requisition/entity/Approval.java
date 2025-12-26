package com.requisition.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "approvals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Approval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "requisition_id")
    private Requisition requisition;

    @ManyToOne(optional = false)
    @JoinColumn(name = "approver_id")
    private User approver;

    private Integer sequenceOrder;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    private String comment;
    private LocalDateTime actionAt;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
