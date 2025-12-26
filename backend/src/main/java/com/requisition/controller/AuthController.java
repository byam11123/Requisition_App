package com.requisition.controller;

import com.requisition.dto.*;
import com.requisition.service.*;
import com.requisition.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OrganizationService organizationService;

    @PostMapping("/register-organization")
    public ResponseEntity<ApiResponse<OrganizationDTO>> registerOrganization(
            @RequestBody RegisterOrganizationRequest request) {
        OrganizationDTO organization = organizationService.registerOrganization(request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Organization registered successfully", organization,
                        java.time.LocalDateTime.now()));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Login successful", response, java.time.LocalDateTime.now()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Object>> refreshToken(HttpServletRequest request) {
        String token = extractToken(request);
        if (token != null && jwtUtil.isTokenValid(token)) {
            Long userId = jwtUtil.extractUserId(token);
            String newToken = jwtUtil.generateToken(userId, ""); // Email usually needed, simplified for now
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Token refreshed",
                            java.util.Map.of("token", newToken), java.time.LocalDateTime.now()));
        }
        return ResponseEntity.status(401)
                .body(new ApiResponse<>(false, "Invalid token", null, java.time.LocalDateTime.now()));
    }

    private String extractToken(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        return auth != null && auth.startsWith("Bearer ") ? auth.substring(7) : null;
    }
}
