package com.requisition.service;

import com.requisition.dto.*;
import com.requisition.entity.*;
import com.requisition.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class RequisitionService {

    @Autowired
    private RequisitionRepository requisitionRepository;
    @Autowired
    private RequisitionTypeRepository typeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ApprovalRepository approvalRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private FileStorageService fileStorageService;

    public RequisitionDTO createRequisition(Long userId, CreateRequisitionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RequisitionType type = typeRepository.findById(request.getRequisitionTypeId())
                .orElseThrow(() -> new RuntimeException("Type not found"));

        Requisition requisition = new Requisition();
        requisition.setType(type);
        requisition.setCreatedBy(user);
        requisition.setDescription(request.getDescription());
        // Map new fields
        requisition.setSiteAddress(request.getSiteAddress());
        requisition.setMaterialDescription(request.getMaterialDescription());
        requisition.setQuantity(request.getQuantity());
        requisition.setAmount(request.getAmount());
        requisition.setPoDetails(request.getPoDetails());
        requisition.setRequiredFor(request.getRequiredFor());
        requisition.setVendorName(request.getVendorName());
        requisition.setIndentNo(request.getIndentNo());
        requisition.setPriority(Requisition.Priority.valueOf(request.getPriority()));

        // Auto-fields
        requisition.setOrganization(user.getOrganization()); // Will fail if user org is null (migration needed)
        requisition.setRequestId(generateRequestId(user.getOrganization()));
        requisition.setStatus(Requisition.RequisitionStatus.DRAFT);
        requisition.setApprovalStatus(Requisition.ApprovalStatus.PENDING);
        requisition.setPaymentStatus(Requisition.PaymentStatus.NOT_DONE);
        requisition.setDispatchStatus(Requisition.DispatchStatus.NOT_DISPATCHED);
        requisition.generateCardSubtitle();

        requisitionRepository.save(requisition);
        RequisitionDTO dto = convertToDTO(requisition);

        // Notify subscribers (scoped by organization)
        Long orgId = requisition.getOrganization() != null ? requisition.getOrganization().getId() : null;
        if (orgId != null) {
            messagingTemplate.convertAndSend("/topic/org." + orgId + "/requisitions", dto);
        }

        return dto;
    }

    public List<RequisitionDTO> getAllRequisitions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return requisitionRepository.findByOrganizationOrderByCreatedAtDesc(user.getOrganization()).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<Requisition> getAllRequisitionsEntities(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return requisitionRepository.findByOrganizationOrderByCreatedAtDesc(user.getOrganization());
    }

    public RequisitionDTO getRequisitionById(Long id, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Requisition req = requisitionRepository.findByIdAndOrganization(id, user.getOrganization())
                .orElseThrow(() -> new RuntimeException("Requisition not found"));
        return convertToDTO(req);
    }

    public RequisitionDTO updateRequisition(Long id, Long userId, CreateRequisitionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Requisition req = requisitionRepository.findByIdAndOrganization(id, user.getOrganization())
                .orElseThrow(() -> new RuntimeException("Requisition not found"));

        // Only allow updates if status is DRAFT
        if (req.getStatus() != Requisition.RequisitionStatus.DRAFT) {
            throw new RuntimeException("Can only update requisitions in DRAFT status");
        }

        boolean isOwner = req.getCreatedBy() != null && req.getCreatedBy().getId().equals(userId);

        // Verify user owns this requisition or is admin
        if (!isOwner && user.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized to update this requisition");
        }

        // Update fields
        req.setDescription(request.getDescription());
        req.setSiteAddress(request.getSiteAddress());
        req.setMaterialDescription(request.getMaterialDescription());
        req.setQuantity(request.getQuantity());
        req.setAmount(request.getAmount());
        req.setPoDetails(request.getPoDetails());
        req.setRequiredFor(request.getRequiredFor());
        req.setVendorName(request.getVendorName());
        req.setIndentNo(request.getIndentNo());
        req.setPriority(Requisition.Priority.valueOf(request.getPriority()));
        req.generateCardSubtitle();

        requisitionRepository.save(req);
        RequisitionDTO dto = convertToDTO(req);

        // Notify subscribers (scoped by organization)
        Long orgId = req.getOrganization() != null ? req.getOrganization().getId() : null;
        if (orgId != null) {
            messagingTemplate.convertAndSend("/topic/org." + orgId + "/requisitions", dto);
        }

        return dto;
    }

    public void deleteRequisition(Long id, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        deleteSingleRequisition(id, user);

        // Notify subscribers (scoped by organization)
        // Note: Notification logic moved inside deleteSingleRequisition or handled here
        // if bulk logic differs
    }

    public void deleteRequisitionsBulk(List<Long> ids, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized for bulk delete. Admin access only.");
        }

        for (Long id : ids) {
            try {
                deleteSingleRequisition(id, user);
            } catch (Exception e) {
                // Log error but continue? Or fail all?
                // For now, fast-fail on first error to be safe, or we could collect errors.
                // Let's allow continuing for others if one is not found/not authorized?
                // Better: Check all permissions first or just let it throw.
                // Throwing is safer for consistency.
                throw e;
            }
        }
    }

    private void deleteSingleRequisition(Long id, User user) {
        Requisition req = requisitionRepository.findByIdAndOrganization(id, user.getOrganization())
                .orElseThrow(() -> new RuntimeException("Requisition not found: " + id));

        boolean isAdmin = user.getRole() == User.UserRole.ADMIN;
        boolean isOwner = req.getCreatedBy() != null && req.getCreatedBy().getId().equals(user.getId());

        if (isAdmin) {
            // Admin can delete DRAFT or COMPLETED
            if (req.getStatus() != Requisition.RequisitionStatus.DRAFT
                    && req.getStatus() != Requisition.RequisitionStatus.COMPLETED) {
                throw new RuntimeException("Admin can only delete DRAFT or COMPLETED requisitions. ID: " + id);
            }
        } else {
            // Non-admin (Purchaser): only delete own DRAFT requisitions
            if (!isOwner) {
                throw new RuntimeException("Unauthorized to delete requisition ID: " + id);
            }
            if (req.getStatus() != Requisition.RequisitionStatus.DRAFT) {
                throw new RuntimeException("Can only delete requisitions in DRAFT status. ID: " + id);
            }
        }

        requisitionRepository.delete(req);

        // Notify subscribers
        Long orgId = req.getOrganization() != null ? req.getOrganization().getId() : null;
        if (orgId != null) {
            messagingTemplate.convertAndSend("/topic/org." + orgId + "/requisitions/deleted", id);
        }
    }

    public RequisitionDTO processApproval(Long id, Long userId, ApprovalActionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Requisition req = requisitionRepository.findByIdAndOrganization(id, user.getOrganization())
                .orElseThrow(() -> new RuntimeException("Requisition not found"));

        if (user.getRole() != User.UserRole.MANAGER && user.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized: Only Managers can approve requisitions");
        }

        Requisition.ApprovalStatus status = Requisition.ApprovalStatus.valueOf(request.getApprovalStatus());
        req.setApprovalStatus(status);
        req.setApprovalNotes(request.getNotes());

        if (status == Requisition.ApprovalStatus.APPROVED) {
            req.setStatus(Requisition.RequisitionStatus.APPROVED);
            req.setApprovedAt(LocalDateTime.now());
            req.setApprovedBy(user);
        } else if (status == Requisition.ApprovalStatus.REJECTED) {
            req.setStatus(Requisition.RequisitionStatus.REJECTED);
        } else if (status == Requisition.ApprovalStatus.HOLD) {
            // Keep status as SUBMITTED or change to HOLD if you want a top-level HOLD
            // status
        }

        req.setManagerTime(LocalDateTime.now());

        requisitionRepository.save(req);
        RequisitionDTO dto = convertToDTO(req);
        Long orgId = req.getOrganization() != null ? req.getOrganization().getId() : null;
        if (orgId != null) {
            messagingTemplate.convertAndSend("/topic/org." + orgId + "/requisitions", dto);
        }
        return dto;
    }

    public RequisitionDTO updatePayment(Long id, Long userId, PaymentUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Requisition req = requisitionRepository.findByIdAndOrganization(id, user.getOrganization())
                .orElseThrow(() -> new RuntimeException("Requisition not found"));

        if (req.getStatus() != Requisition.RequisitionStatus.APPROVED) {
            // Depending on workflow, payment might only be allowed if approved.
            // throw new RuntimeException("Requisition must be APPROVED before payment");
        }

        if (user.getRole() != User.UserRole.ACCOUNTANT && user.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized: Only Accountants can update payment");
        }

        req.setPaymentStatus(Requisition.PaymentStatus.valueOf(request.getPaymentStatus()));
        req.setPaymentUtrNo(request.getUtrNo());
        // Simple mapping for demo if enum doesn't match exactly or use valueOf
        try {
            if (request.getPaymentMode() != null) {
                req.setModeOfPayment(Requisition.ModeOfPayment.valueOf(request.getPaymentMode()));
            }
        } catch (IllegalArgumentException e) {
            // handle error or default
        }

        req.setPaymentMode(request.getPaymentMode()); // String field
        req.setPaymentDate(request.getPaymentDate());
        req.setPaymentAmount(request.getAmount());
        req.setAccountantTime(LocalDateTime.now());

        if (req.getPaymentStatus() == Requisition.PaymentStatus.DONE) {
            req.setPaidAt(LocalDateTime.now());
            req.setPaidBy(user);
            // Optionally set status to PAID if you track it at top level
            // req.setStatus(Requisition.RequisitionStatus.PAID);
        }

        requisitionRepository.save(req);
        RequisitionDTO dto = convertToDTO(req);
        Long orgId = req.getOrganization() != null ? req.getOrganization().getId() : null;
        if (orgId != null) {
            messagingTemplate.convertAndSend("/topic/org." + orgId + "/requisitions", dto);
        }
        return dto;
    }

    public RequisitionDTO processMaterialReceipt(Long id, Long userId, MaterialReceiptRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Requisition req = requisitionRepository.findByIdAndOrganization(id, user.getOrganization())
                .orElseThrow(() -> new RuntimeException("Requisition not found"));

        // Allow creator or Admin or Manager? Usually Purchaser (creator) confirms
        // receipt
        if (!req.getCreatedBy().getId().equals(userId)) {
            // Check role?
        }

        req.setMaterialReceived(request.getMaterialReceived());
        req.setReceiptNotes(request.getReceiptNotes());

        requisitionRepository.save(req);
        RequisitionDTO dto = convertToDTO(req);
        Long orgId = req.getOrganization() != null ? req.getOrganization().getId() : null;
        if (orgId != null) {
            messagingTemplate.convertAndSend("/topic/org." + orgId + "/requisitions", dto);
        }
        return dto;
    }

    public RequisitionDTO uploadFile(Long id, Long userId, String fileType, String fileName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Requisition req = requisitionRepository.findByIdAndOrganization(id, user.getOrganization())
                .orElseThrow(() -> new RuntimeException("Requisition not found"));

        String fileUrl = "/uploads/" + fileName; // Relative URL served by static resource handler

        switch (fileType) {
            case "payment":
                req.setPaymentPhotoUrl(fileUrl);
                break;
            case "material":
                req.setMaterialPhotoUrl(fileUrl);
                break;
            case "bill":
                req.setBillPhotoUrl(fileUrl);
                break;
            case "vendor_payment":
                req.setVendorPaymentDetailsUrl(fileUrl);
                break;
        }

        requisitionRepository.save(req);
        RequisitionDTO dto = convertToDTO(req);
        Long orgId = req.getOrganization() != null ? req.getOrganization().getId() : null;
        if (orgId != null) {
            messagingTemplate.convertAndSend("/topic/org." + orgId + "/requisitions", dto);
        }
        return dto;
    }

    public String storeFile(MultipartFile file) {
        return fileStorageService.storeFile(file);
    }

    public void submitRequisition(Long requisitionId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Requisition req = requisitionRepository.findByIdAndOrganization(requisitionId, user.getOrganization())
                .orElseThrow(() -> new RuntimeException("Requisition not found"));

        req.setStatus(Requisition.RequisitionStatus.SUBMITTED);
        req.setSubmittedAt(LocalDateTime.now());
        requisitionRepository.save(req);

        createApprovalChain(req);

        // Notify subscribers (scoped by organization)
        Long orgId = req.getOrganization() != null ? req.getOrganization().getId() : null;
        if (orgId != null) {
            messagingTemplate.convertAndSend("/topic/org." + orgId + "/requisitions", convertToDTO(req));
        }
    }

    private void createApprovalChain(Requisition requisition) {
        List<User> managers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.MANAGER)
                .filter(u -> u.getOrganization() != null
                        && requisition.getOrganization() != null
                        && u.getOrganization().getId().equals(requisition.getOrganization().getId()))
                .toList();

        int sequence = 1;
        for (User manager : managers) {
            Approval approval = new Approval();
            approval.setRequisition(requisition);
            approval.setApprover(manager);
            approval.setSequenceOrder(sequence++);
            approval.setStatus(Approval.ApprovalStatus.PENDING);
            approvalRepository.save(approval);
        }
    }

    private synchronized String generateRequestId(Organization org) {
        if (org == null) {
            throw new RuntimeException("Organization is required to generate request ID");
        }

        // 1. Determine Prefix
        String prefix = org.getRequisitionPrefix();
        if (prefix == null || prefix.trim().isEmpty()) {
            prefix = org.getName().replaceAll("\\s+", "").toUpperCase();
            if (prefix.length() > 3)
                prefix = prefix.substring(0, 3);
        }
        prefix = prefix.toUpperCase();

        // 2. Determine Year (YY)
        String year = java.time.Year.now().format(java.time.format.DateTimeFormatter.ofPattern("yy"));

        // 3. Determine Type Code (P for Purchase)
        String typeCode = "P";

        // 4. Construct Search Prefix: ORB/25/P
        String searchPrefix = prefix + "/" + year + "/" + typeCode;

        // 5. Find last ID matching this pattern
        String lastId = requisitionRepository.findLastRequestIdByPrefix(searchPrefix);

        int nextSeq = 1;
        if (lastId != null) {
            // Extract sequence part (last 5 digits)
            // Format: PREFIX/YY/P00001
            // We assume the suffix is exactly 5 digits.
            // Let's be robust: substring after the last 'P' or just take last 5 chars?
            // Safer: remove the searchPrefix and parse the rest.
            try {
                // lastId: ORB/25/P00001 -> remove ORB/25/P -> 00001
                // searchPrefix: ORB/25/P
                // Note: searchPrefix might not match perfectly if we used LIKE in query
                // correctly?
                // The query was LIKE :prefix%, so lastId definitely starts with searchPrefix.
                String seqStr = lastId.substring(searchPrefix.length());
                nextSeq = Integer.parseInt(seqStr) + 1;
            } catch (Exception e) {
                // Fallback if parsing fails (shouldn't happen with controlled format)
                nextSeq = 1;
            }
        }

        // 6. Format New ID
        // Format: ORB/25/P00001
        return String.format("%s%05d", searchPrefix, nextSeq);
    }

    public List<Requisition> getRequisitionsByIds(List<Long> ids, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return requisitionRepository.findByOrganizationOrderByCreatedAtDesc(user.getOrganization()).stream()
                .filter(req -> ids.contains(req.getId()))
                .toList(); // Filter in memory for simplicity and security (ensures org check)
    }

    private RequisitionDTO convertToDTO(Requisition req) {
        RequisitionDTO dto = new RequisitionDTO();
        dto.setId(req.getId());
        dto.setRequestId(req.getRequestId());
        dto.setType(req.getType().getName());
        dto.setDescription(req.getDescription());
        dto.setAmount(req.getAmount());
        dto.setStatus(req.getStatus().toString());
        dto.setApprovalStatus(req.getApprovalStatus().toString());
        dto.setPaymentStatus(req.getPaymentStatus().toString());
        dto.setDispatchStatus(req.getDispatchStatus().toString());
        dto.setPriority(req.getPriority().toString());
        dto.setSiteAddress(req.getSiteAddress());
        dto.setMaterialDescription(req.getMaterialDescription());
        dto.setQuantity(req.getQuantity());
        dto.setPoDetails(req.getPoDetails());
        dto.setRequiredFor(req.getRequiredFor());
        dto.setVendorName(req.getVendorName());
        dto.setIndentNo(req.getIndentNo());

        // New fields
        dto.setPaymentUtrNo(req.getPaymentUtrNo());
        dto.setPaymentMode(req.getPaymentMode());
        dto.setPaymentDate(req.getPaymentDate());
        dto.setPaymentAmount(req.getPaymentAmount());
        dto.setPaymentPhotoUrl(req.getPaymentPhotoUrl());
        dto.setMaterialPhotoUrl(req.getMaterialPhotoUrl());
        dto.setBillPhotoUrl(req.getBillPhotoUrl());
        dto.setVendorPaymentDetailsUrl(req.getVendorPaymentDetailsUrl());
        dto.setApprovalNotes(req.getApprovalNotes());
        dto.setMaterialReceived(req.getMaterialReceived());
        dto.setReceiptNotes(req.getReceiptNotes());

        dto.setCreatedBy(new UserDTO(
                req.getCreatedBy().getId(),
                req.getCreatedBy().getEmail(),
                req.getCreatedBy().getFullName(),
                req.getCreatedBy().getRole().toString(),
                req.getCreatedBy().getDesignation(),
                req.getCreatedBy().getDepartment(),
                req.getCreatedBy().getProfilePhotoUrl(),
                req.getCreatedBy().getOrganization() != null ? req.getCreatedBy().getOrganization().getId() : null,
                req.getCreatedBy().getOrganization() != null ? req.getCreatedBy().getOrganization().getName() : null,
                req.getCreatedBy().isActive()));
        dto.setCreatedByName(req.getCreatedBy().getFullName());
        dto.setApprovedByName(req.getApprovedBy() != null ? req.getApprovedBy().getFullName() : null);
        dto.setPaidByName(req.getPaidBy() != null ? req.getPaidBy().getFullName() : null);
        dto.setDispatchedByName(req.getDispatchedBy() != null ? req.getDispatchedBy().getFullName() : null);
        dto.setCreatedAt(req.getCreatedAt());
        dto.setUpdatedAt(req.getUpdatedAt());
        dto.setApprovedAt(req.getApprovedAt());
        dto.setPaidAt(req.getPaidAt());
        dto.setDispatchedAt(req.getDispatchedAt());

        return dto;
    }
}
