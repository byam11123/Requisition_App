package com.requisition.repository;

import com.requisition.entity.Requisition;
import com.requisition.entity.RequisitionType;
import com.requisition.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RequisitionRepository extends JpaRepository<Requisition, Long> {
        // Find by type and status
        List<Requisition> findByTypeAndApprovalStatusOrderByCreatedAtDesc(
                        RequisitionType type,
                        Requisition.ApprovalStatus status);

        List<Requisition> findByTypeAndPaymentStatusOrderByCreatedAtDesc(
                        RequisitionType type,
                        Requisition.PaymentStatus status);

        // Find by type for dashboard
        List<Requisition> findByTypeOrderByCreatedAtDesc(RequisitionType type);

        // Find by created user
        List<Requisition> findByCreatedByOrderByCreatedAtDesc(User user);

        // Count by type and status
        Long countByTypeAndApprovalStatus(RequisitionType type, Requisition.ApprovalStatus status);

        Long countByTypeAndPaymentStatus(RequisitionType type, Requisition.PaymentStatus status);

        Long countByType(RequisitionType type);

        // Find by requestId
        Optional<Requisition> findByRequestId(String requestId);

        // Get next request ID number
        @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(request_id, 5) AS INTEGER)), 0) + 1 FROM requisitions", nativeQuery = true)
        Integer getNextRequestIdNumber();

        // Statistics query
        @Query("SELECT COUNT(r) FROM Requisition r WHERE r.type = :type AND r.approvalStatus = :status")
        Long countByTypeAndApprovalStatusQuery(@Param("type") RequisitionType type,
                        @Param("status") Requisition.ApprovalStatus status);
}
