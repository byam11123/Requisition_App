package com.requisition.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "requisition_id")
    private Requisition requisition;

    private String fileName;
    private String fileUrl; // S3 URL or local path
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    private AttachmentCategory category; // ITEM, BILL, PAYMENT

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    private LocalDateTime uploadedAt = LocalDateTime.now();

    public enum AttachmentCategory {
        ITEM, // Item photos
        BILL, // Bill/invoice photos
        PAYMENT // Payment proof photos
    }
}
