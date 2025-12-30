package com.requisition.repository;

import com.requisition.entity.Requisition;
import com.requisition.entity.RequisitionType;
import com.requisition.entity.User;
import com.requisition.entity.Organization;
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

        // Organization-scoped queries for multi-tenant isolation
        List<Requisition> findByOrganizationOrderByCreatedAtDesc(Organization organization);

        List<Requisition> findByOrganizationAndTypeOrderByCreatedAtDesc(Organization organization,
                        RequisitionType type);

        // Find by created user
        List<Requisition> findByCreatedByOrderByCreatedAtDesc(User user);

        // Count by type and status
        Long countByTypeAndApprovalStatus(RequisitionType type, Requisition.ApprovalStatus status);

        Long countByTypeAndPaymentStatus(RequisitionType type, Requisition.PaymentStatus status);

        Long countByType(RequisitionType type);

        // Organization + type scoped counts
        Long countByOrganizationAndTypeAndApprovalStatus(Organization organization, RequisitionType type,
                        Requisition.ApprovalStatus status);

        Long countByOrganizationAndTypeAndPaymentStatus(Organization organization, RequisitionType type,
                        Requisition.PaymentStatus status);

        Long countByOrganizationAndType(Organization organization, RequisitionType type);

        // Find by requestId
        Optional<Requisition> findByRequestId(String requestId);

        // Find by id and organization (safety for detail views)
        Optional<Requisition> findByIdAndOrganization(Long id, Organization organization);

        // Get next request ID number (global - deprecated)
        @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(request_id, 5) AS INTEGER)), 0) + 1 FROM requisitions", nativeQuery = true)
        Integer getNextRequestIdNumber();

        // Get next request ID number for a specific organization
        @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(request_id FROM POSITION('-' IN request_id) + 1) AS INTEGER)), 0) + 1 "
                        +
                        "FROM requisitions WHERE organization_id = :orgId", nativeQuery = true)
        Integer getNextRequestIdNumberForOrg(@Param("orgId") Long orgId);

        @Query(value = "SELECT request_id FROM requisitions WHERE request_id LIKE :prefix% ORDER BY request_id DESC LIMIT 1", nativeQuery = true)
        String findLastRequestIdByPrefix(@Param("prefix") String prefix);

        // Statistics query
        @Query("SELECT COUNT(r) FROM Requisition r WHERE r.type = :type AND r.approvalStatus = :status")
        Long countByTypeAndApprovalStatusQuery(@Param("type") RequisitionType type,
                        @Param("status") Requisition.ApprovalStatus status);
}
