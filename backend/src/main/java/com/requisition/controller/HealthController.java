package com.requisition.controller;

import com.requisition.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<String>> checkHealth() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Service is healthy", "UP", java.time.LocalDateTime.now()));
    }
}
