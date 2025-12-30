package com.requisition.service;

import com.requisition.entity.Requisition;
import com.requisition.entity.User;
import com.requisition.repository.RequisitionRepository;
import com.requisition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class DispatchService {

    @Autowired
    private RequisitionRepository requisitionRepository;

    @Autowired
    private UserRepository userRepository;

    public void markAsDispatched(Long requisitionId, Long userId) {
        User purchaser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Requisition requisition = requisitionRepository.findByIdAndOrganization(requisitionId,
                purchaser.getOrganization())
                .orElseThrow(() -> new RuntimeException("Requisition not found"));

        if (purchaser.getRole() != User.UserRole.PURCHASER && purchaser.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Only purchasers or admins can dispatch goods");
        }

        requisition.setDispatchStatus(Requisition.DispatchStatus.DISPATCHED);
        requisition.setDispatchedBy(purchaser);
        requisition.setDispatchedAt(LocalDateTime.now());

        requisitionRepository.save(requisition);
    }
}
