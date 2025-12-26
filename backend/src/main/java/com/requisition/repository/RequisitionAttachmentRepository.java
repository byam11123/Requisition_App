package com.requisition.repository;

import com.requisition.entity.RequisitionAttachment;
import com.requisition.entity.Requisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequisitionAttachmentRepository extends JpaRepository<RequisitionAttachment, Long> {
    List<RequisitionAttachment> findByRequisitionAndCategory(
            Requisition requisition,
            RequisitionAttachment.AttachmentCategory category);

    List<RequisitionAttachment> findByRequisition(Requisition requisition);
}
