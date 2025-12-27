package com.requisition.controller;

import com.requisition.dto.ApiResponse;
import com.requisition.dto.OrganizationDTO;
import com.requisition.entity.User;
import com.requisition.repository.UserRepository;
import com.requisition.security.JwtUtil;
import com.requisition.service.OrganizationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/organization")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<OrganizationDTO>> getOrganization(HttpServletRequest request) {
        Long userId = extractUserId(request);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrganizationDTO org = organizationService.getOrganizationDetails(user.getOrganization().getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Organization retrieved", org));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<OrganizationDTO>> updateOrganization(
            @RequestBody OrganizationDTO request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only admins can update organization
        if (user.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Only admins can update organization details");
        }

        OrganizationDTO updated = organizationService.updateOrganization(user.getOrganization().getId(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Organization updated successfully", updated));
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("No valid token found");
    }
}
