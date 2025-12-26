package com.requisition.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sync_logs", indexes = {
        @Index(name = "idx_synced", columnList = "synced"),
        @Index(name = "idx_created_at", columnList = "created_at DESC")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyncLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    private String entityType; // REQUISITION, APPROVAL
    private Long entityId;

    @Enumerated(EnumType.STRING)
    private SyncOperation operation;

    @Column(columnDefinition = "TEXT")
    private String payload;

    private boolean synced = false;
    private LocalDateTime syncAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum SyncOperation {
        CREATE, UPDATE, DELETE
    }
}
