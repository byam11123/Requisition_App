package com.requisition.service;

import com.requisition.dto.OrganizationDTO;
import com.requisition.dto.RegisterOrganizationRequest;
import com.requisition.entity.Organization;
import com.requisition.entity.User;
import com.requisition.repository.OrganizationRepository;
import com.requisition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public OrganizationDTO registerOrganization(RegisterOrganizationRequest request) {
        // 1. Create Organization
        Organization org = new Organization();
        org.setName(request.getOrganizationName());
        org.setContactEmail(request.getContactEmail());
        org.setContactPhone(request.getContactPhone());
        org.setAddress(request.getAddress());
        org.setActive(true);
        org.setSubscriptionPlan("FREE");

        organizationRepository.save(org);

        // 2. Create Admin User
        User admin = new User();
        admin.setOrganization(org);
        admin.setEmail(request.getAdminEmail());
        admin.setFullName(request.getAdminName());
        admin.setPasswordHash(passwordEncoder.encode(request.getAdminPassword()));
        admin.setRole(User.UserRole.ADMIN);
        admin.setDesignation("Administrator");
        admin.setActive(true);

        userRepository.save(admin);

        return convertToDTO(org);
    }

    public OrganizationDTO getOrganizationDetails(Long orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        return convertToDTO(org);
    }

    private OrganizationDTO convertToDTO(Organization org) {
        return new OrganizationDTO(
                org.getId(),
                org.getName(),
                org.getContactEmail(),
                org.getContactPhone(),
                org.getAddress(),
                org.getSubscriptionPlan(),
                org.isActive(),
                org.getCreatedAt(),
                org.getUsers() != null ? org.getUsers().size() : 0,
                org.getRequisitions() != null ? org.getRequisitions().size() : 0);
    }
}
