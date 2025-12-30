package com.requisition.controller;

import com.requisition.dto.*;
import com.requisition.service.*;
import com.requisition.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/v1/requisitions")
@CrossOrigin(origins = "http://localhost:3000")
public class RequisitionController {

        @Autowired
        private RequisitionService requisitionService;
        @Autowired
        private JwtUtil jwtUtil;

        @PostMapping
        public ResponseEntity<ApiResponse<RequisitionDTO>> createRequisition(
                        @RequestBody CreateRequisitionRequest request,
                        HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);
                RequisitionDTO requisition = requisitionService.createRequisition(userId, request);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Requisition created", requisition,
                                                java.time.LocalDateTime.now()));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<RequisitionDTO>>> getAll(HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);
                List<RequisitionDTO> requisitions = requisitionService.getAllRequisitions(userId);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Requisitions retrieved", requisitions,
                                                java.time.LocalDateTime.now()));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<RequisitionDTO>> getById(@PathVariable Long id,
                        HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);
                RequisitionDTO requisition = requisitionService.getRequisitionById(id, userId);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Requisition retrieved", requisition,
                                                java.time.LocalDateTime.now()));
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<RequisitionDTO>> updateRequisition(
                        @PathVariable Long id,
                        @RequestBody CreateRequisitionRequest request,
                        HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);
                RequisitionDTO requisition = requisitionService.updateRequisition(id, userId, request);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Requisition updated", requisition,
                                                java.time.LocalDateTime.now()));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<String>> deleteRequisition(
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);
                requisitionService.deleteRequisition(id, userId);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Requisition deleted", null, java.time.LocalDateTime.now()));
        }

        @DeleteMapping("/bulk")
        public ResponseEntity<ApiResponse<String>> deleteRequisitionsBulk(
                        @RequestBody List<Long> ids,
                        HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);
                requisitionService.deleteRequisitionsBulk(ids, userId);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Requisitions deleted successfully", null,
                                                java.time.LocalDateTime.now()));
        }

        @PostMapping("/{id}/submit")
        public ResponseEntity<ApiResponse<String>> submitRequisition(@PathVariable Long id,
                        HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);
                requisitionService.submitRequisition(id, userId);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Requisition submitted for approval", null,
                                                java.time.LocalDateTime.now()));
        }

        @PostMapping("/{id}/approve")
        public ResponseEntity<ApiResponse<RequisitionDTO>> processApproval(
                        @PathVariable Long id,
                        @RequestBody ApprovalActionRequest request,
                        HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);
                RequisitionDTO requisition = requisitionService.processApproval(id, userId, request);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Approval processed", requisition,
                                                java.time.LocalDateTime.now()));
        }

        @PostMapping("/{id}/payment")
        public ResponseEntity<ApiResponse<RequisitionDTO>> updatePayment(
                        @PathVariable Long id,
                        @RequestBody PaymentUpdateRequest request,
                        HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);
                RequisitionDTO requisition = requisitionService.updatePayment(id, userId, request);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Payment updated", requisition, java.time.LocalDateTime.now()));
        }

        @PostMapping("/{id}/material-receipt")
        public ResponseEntity<ApiResponse<RequisitionDTO>> processMaterialReceipt(
                        @PathVariable Long id,
                        @RequestBody MaterialReceiptRequest request,
                        HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);
                RequisitionDTO requisition = requisitionService.processMaterialReceipt(id, userId, request);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Material receipt processed", requisition,
                                                java.time.LocalDateTime.now()));
        }

        @PostMapping("/{id}/upload")
        public ResponseEntity<ApiResponse<RequisitionDTO>> uploadFile(
                        @PathVariable Long id,
                        @RequestParam("file") MultipartFile file,
                        @RequestParam("type") String type, // payment, material, bill
                        HttpServletRequest httpRequest) {
                Long userId = extractUserId(httpRequest);

                String fileName = requisitionService.storeFile(file);
                RequisitionDTO requisition = requisitionService.uploadFile(id, userId, type, fileName);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "File uploaded", requisition, java.time.LocalDateTime.now()));
        }

        @Autowired
        private ExcelExportService excelExportService;

        @GetMapping("/export")
        public ResponseEntity<org.springframework.core.io.Resource> exportRequisitions(HttpServletRequest httpRequest)
                        throws java.io.IOException {
                Long userId = extractUserId(httpRequest);
                List<com.requisition.entity.Requisition> requisitions = requisitionService
                                .getAllRequisitionsEntities(userId);
                java.io.ByteArrayInputStream in = excelExportService.exportRequisitions(requisitions);

                org.springframework.core.io.InputStreamResource resource = new org.springframework.core.io.InputStreamResource(
                                in);

                return ResponseEntity.ok()
                                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=requisitions.xlsx")
                                .contentType(org.springframework.http.MediaType.parseMediaType(
                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .body(resource);
        }

        @PostMapping("/export/selected")
        public ResponseEntity<org.springframework.core.io.Resource> exportSelectedRequisitions(
                        @RequestBody List<Long> ids,
                        HttpServletRequest httpRequest)
                        throws java.io.IOException {
                Long userId = extractUserId(httpRequest);
                List<com.requisition.entity.Requisition> requisitions = requisitionService
                                .getRequisitionsByIds(ids, userId);
                java.io.ByteArrayInputStream in = excelExportService.exportRequisitions(requisitions);

                org.springframework.core.io.InputStreamResource resource = new org.springframework.core.io.InputStreamResource(
                                in);

                return ResponseEntity.ok()
                                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=selected_requisitions.xlsx")
                                .contentType(org.springframework.http.MediaType.parseMediaType(
                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .body(resource);
        }

        private Long extractUserId(HttpServletRequest request) {
                String auth = request.getHeader("Authorization");
                if (auth != null && auth.startsWith("Bearer ")) {
                        String token = auth.substring(7);
                        return jwtUtil.extractUserId(token);
                }
                // For MVP testing without auth in SecurityConfig, we might need a fallback,
                // but normally this should throw or be handled by filter.
                // Returning mock ID 1 for testing if no token provided (DANGEROUS in prod,
                // acceptable for initial dev step)
                // return 1L;
                throw new RuntimeException("Unauthorized");
        }
}
