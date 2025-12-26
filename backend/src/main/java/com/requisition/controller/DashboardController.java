package com.requisition.controller;

import com.requisition.dto.*;
import com.requisition.service.*;
import com.requisition.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;
    @Autowired
    private RequisitionService requisitionService; // Reuse existing logical flow
    @Autowired
    private DispatchService dispatchService;
    @Autowired
    private JwtUtil jwtUtil;

    // Get stats for a requisition type
    @GetMapping("/stats/{typeId}")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getStats(@PathVariable Long typeId) {
        DashboardStatsDTO stats = dashboardService.getDashboardStats(typeId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Stats retrieved", stats));
    }

    // Get all requisitions for a type
    @GetMapping("/requisitions/{typeId}")
    public ResponseEntity<ApiResponse<List<RequisitionCardDTO>>> getRequisitionsByType(
            @PathVariable Long typeId) {
        List<RequisitionCardDTO> requisitions = dashboardService.getRequisitionsByType(typeId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Requisitions retrieved", requisitions));
    }

    // Get detail
    @GetMapping("/requisitions/{id}/detail")
    public ResponseEntity<ApiResponse<RequisitionDetailDTO>> getRequisitionDetail(@PathVariable Long id) {
        RequisitionDetailDTO detail = dashboardService.getRequisitionDetail(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Requisition detail retrieved", detail));
    }

    // Create new requisition
    @PostMapping("/requisitions/create")
    public ResponseEntity<ApiResponse<RequisitionDTO>> createRequisition(
            @RequestBody CreateRequisitionRequest request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        RequisitionDTO requisition = requisitionService.createRequisition(userId, request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Requisition created", requisition));
    }

    // Submit for approval
    @PostMapping("/requisitions/{id}/submit")
    public ResponseEntity<ApiResponse<String>> submitRequisition(@PathVariable Long id) {
        requisitionService.submitRequisition(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Requisition submitted for approval", null));
    }

    // Dispatch action
    @PostMapping("/requisitions/{id}/dispatch")
    public ResponseEntity<ApiResponse<String>> markAsDispatched(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        dispatchService.markAsDispatched(id, userId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Marked as dispatched", null));
    }

    private Long extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Unauthorized");
    }
}
