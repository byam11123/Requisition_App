package com.requisition.repository;

import com.requisition.entity.Approval;
import com.requisition.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findByRequisitionIdOrderBySequenceOrder(Long requisitionId);

    List<Approval> findByApproverAndStatusOrderByCreatedAtDesc(User approver, Approval.ApprovalStatus status);
}
