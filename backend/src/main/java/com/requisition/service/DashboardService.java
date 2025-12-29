package com.requisition.service;

import com.requisition.dto.*;
import com.requisition.entity.*;
import com.requisition.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DashboardService {

        @Autowired
        private RequisitionRepository requisitionRepository;
        @Autowired
        private RequisitionTypeRepository typeRepository;
        @Autowired
        private RequisitionAttachmentRepository attachmentRepository;
        @Autowired
        private ApprovalRepository approvalRepository;

        public DashboardStatsDTO getDashboardStats(Long requisitionTypeId) {
                RequisitionType type = typeRepository.findById(requisitionTypeId)
                                .orElseThrow(() -> new RuntimeException("Type not found"));

                DashboardStatsDTO stats = new DashboardStatsDTO();
                stats.setDraftCount(
                                requisitionRepository.countByTypeAndApprovalStatus(type,
                                                Requisition.ApprovalStatus.PENDING)); // Placeholder
                                                                                      // logic
                stats.setPendingCount(
                                requisitionRepository.countByTypeAndApprovalStatus(type,
                                                Requisition.ApprovalStatus.PENDING));
                stats.setApprovedCount(
                                requisitionRepository.countByTypeAndApprovalStatus(type,
                                                Requisition.ApprovalStatus.APPROVED));
                stats.setPaidCount(requisitionRepository.countByTypeAndPaymentStatus(type,
                                Requisition.PaymentStatus.DONE));
                stats.setRejectedCount(
                                requisitionRepository.countByTypeAndApprovalStatus(type,
                                                Requisition.ApprovalStatus.REJECTED));
                stats.setTotalCount(requisitionRepository.countByType(type));

                return stats;
        }

        public List<RequisitionCardDTO> getRequisitionsByType(Long requisitionTypeId) {
                RequisitionType type = typeRepository.findById(requisitionTypeId)
                                .orElseThrow(() -> new RuntimeException("Type not found"));

                return requisitionRepository.findByTypeOrderByCreatedAtDesc(type)
                                .stream()
                                .map(this::convertToCardDTO)
                                .collect(Collectors.toList());
        }

        public RequisitionDetailDTO getRequisitionDetail(Long requisitionId) {
                Requisition req = requisitionRepository.findById(requisitionId)
                                .orElseThrow(() -> new RuntimeException("Requisition not found"));

                RequisitionDetailDTO detail = new RequisitionDetailDTO();
                detail.setId(req.getId());
                detail.setRequestId(req.getRequestId());
                detail.setType(req.getType().getName());
                detail.setStatus(req.getStatus().toString());
                detail.setApprovalStatus(req.getApprovalStatus().toString());
                detail.setPaymentStatus(req.getPaymentStatus().toString());
                detail.setDispatchStatus(req.getDispatchStatus().toString());
                detail.setPriority(req.getPriority().toString());

                detail.setDescription(req.getDescription());
                detail.setSiteAddress(req.getSiteAddress());
                detail.setMaterialDescription(req.getMaterialDescription());
                detail.setQuantity(req.getQuantity());
                detail.setQuantity(req.getQuantity());
                detail.setAmount(req.getAmount());

                detail.setPoDetails(req.getPoDetails());
                detail.setRequiredFor(req.getRequiredFor());
                detail.setVendorName(req.getVendorName());
                detail.setIndentNo(req.getIndentNo());

                detail.setModeOfPayment(req.getModeOfPayment() != null ? req.getModeOfPayment().toString() : null);
                detail.setPaymentDetails(req.getPaymentDetails());

                if (req.getCreatedBy() != null) {
                        detail.setCreatedBy(new UserDTO(
                                        req.getCreatedBy().getId(),
                                        req.getCreatedBy().getEmail(),
                                        req.getCreatedBy().getFullName(),
                                        req.getCreatedBy().getRole().toString(),
                                        req.getCreatedBy().getDesignation(),
                                        req.getCreatedBy().getDepartment(),
                                        req.getCreatedBy().getProfilePhotoUrl(),
                                        req.getCreatedBy().getOrganization().getId(),
                                        req.getCreatedBy().getOrganization().getName(),
                                        req.getCreatedBy().isActive()));
                }
                if (req.getDispatchedBy() != null) {
                        detail.setDispatchedBy(new UserDTO(
                                        req.getDispatchedBy().getId(),
                                        req.getDispatchedBy().getEmail(),
                                        req.getDispatchedBy().getFullName(),
                                        req.getDispatchedBy().getRole().toString(),
                                        req.getDispatchedBy().getDesignation(),
                                        req.getDispatchedBy().getDepartment(),
                                        req.getDispatchedBy().getProfilePhotoUrl(),
                                        req.getDispatchedBy().getOrganization().getId(),
                                        req.getDispatchedBy().getOrganization().getName(),
                                        req.getDispatchedBy().isActive()));
                        detail.setDispatchedByName(req.getDispatchedBy().getFullName());
                }

                // Names for status timeline
                if (req.getApprovedBy() != null) {
                        detail.setApprovedByName(req.getApprovedBy().getFullName());
                }
                if (req.getPaidBy() != null) {
                        detail.setPaidByName(req.getPaidBy().getFullName());
                }

                detail.setCreatedAt(req.getCreatedAt());
                detail.setUpdatedAt(req.getUpdatedAt());
                detail.setSubmittedAt(req.getSubmittedAt());
                detail.setApprovedAt(req.getApprovedAt());
                detail.setPaidAt(req.getPaidAt());
                detail.setDispatchedAt(req.getDispatchedAt());

                return detail;
        }

        private RequisitionCardDTO convertToCardDTO(Requisition req) {
                RequisitionCardDTO card = new RequisitionCardDTO();
                card.setId(req.getId());
                card.setRequestId(req.getRequestId());
                card.setType(req.getType().getName());
                card.setDescription(req.getDescription());
                card.setDescription(req.getDescription());
                card.setAmount(req.getAmount());
                card.setStatus(req.getStatus().toString());
                card.setStatus(req.getStatus().toString());
                card.setApprovalStatus(req.getApprovalStatus().toString());
                card.setPaymentStatus(req.getPaymentStatus().toString());
                card.setDispatchStatus(req.getDispatchStatus().toString());
                card.setPriority(req.getPriority().toString());
                card.setCardSubtitleInfo(req.getCardSubtitleInfo());
                card.setCreatedByName(req.getCreatedBy().getFullName());
                card.setCreatedAt(req.getCreatedAt());
                card.setSiteAddress(req.getSiteAddress());
                card.setVendorName(req.getVendorName());
                return card;
        }
}
