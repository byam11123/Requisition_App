package com.requisition.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "requisitions", indexes = {
        @Index(name = "idx_organization", columnList = "organization_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_approval_status", columnList = "approval_status"),
        @Index(name = "idx_payment_status", columnList = "payment_status"),
        @Index(name = "idx_created_at", columnList = "created_at DESC")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Requisition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne
    @JoinColumn(name = "requisition_type_id")
    private RequisitionType type;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    // Request tracking
    @Column(unique = true)
    private String requestId; // REQ-0001, REQ-0002, etc.

    @Enumerated(EnumType.STRING)
    private RequisitionStatus status = RequisitionStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.NOT_DONE;

    @Enumerated(EnumType.STRING)
    private DispatchStatus dispatchStatus = DispatchStatus.NOT_DISPATCHED;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.NORMAL;

    // Core fields
    @Column(columnDefinition = "TEXT")
    private String description;

    private String siteAddress;
    private String materialDescription;
    private Integer quantity;
    private Double amount;

    // Purchase details
    private String poDetails;
    private String requiredFor;
    private String vendorName;
    private String indentNo;

    // Payment fields
    @Enumerated(EnumType.STRING)
    private ModeOfPayment modeOfPayment;

    private String paymentDetails; // UTR NO, etc.

    // New payment tracking fields
    private String paymentUtrNo;
    private String paymentMode; // Instant/UPI/Account
    private LocalDateTime paymentDate;
    private Double paymentAmount;

    // File upload URLs
    private String paymentPhotoUrl;
    private String materialPhotoUrl;
    private String billPhotoUrl;

    // Workflow tracking
    @Column(columnDefinition = "TEXT")
    private String approvalNotes;
    private Boolean materialReceived = false;
    @Column(columnDefinition = "TEXT")
    private String receiptNotes;

    // Dispatch tracking
    @ManyToOne
    @JoinColumn(name = "dispatched_by")
    private User dispatchedBy;

    private LocalDateTime dispatchedAt;

    // Timestamps
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime paidAt;
    private LocalDateTime managerTime;
    private LocalDateTime accountantTime;

    // Display field
    private String cardSubtitleInfo; // SITE • NAME • ₹ AMOUNT

    @OneToMany(mappedBy = "requisition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequisitionAttachment> attachments;

    @OneToMany(mappedBy = "requisition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Approval> approvals;

    public enum RequisitionStatus {
        DRAFT, SUBMITTED, APPROVED, REJECTED, PAID, COMPLETED
    }

    public enum ApprovalStatus {
        PENDING, TO_REVIEW, HOLD, APPROVED, REJECTED
    }

    public enum PaymentStatus {
        NOT_DONE, PARTIAL, DONE
    }

    public enum DispatchStatus {
        NOT_DISPATCHED, DISPATCHED, DELIVERED
    }

    public enum Priority {
        LOW, NORMAL, HIGH, URGENT
    }

    public enum ModeOfPayment {
        CASH, NEFT, RTGS, UPI, CARD, CHEQUE, OTHER
    }

    // Helper to generate card subtitle
    public void generateCardSubtitle() {
        this.cardSubtitleInfo = String.format("%s • %s • ₹ %,.0f",
                this.siteAddress != null ? this.siteAddress : "N/A",
                this.createdBy != null ? this.createdBy.getFullName() : "N/A",
                this.amount != null ? this.amount : 0);
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
