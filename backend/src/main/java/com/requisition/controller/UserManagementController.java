package com.requisition.controller;

import com.requisition.dto.CreateUserRequest;
import com.requisition.dto.UpdateUserRequest;
import com.requisition.dto.UserDTO;
import com.requisition.dto.ApiResponse;
import com.requisition.service.UserManagementService;
import com.requisition.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserManagementController {

    @Autowired
    private UserManagementService userManagementService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @RequestBody CreateUserRequest request,
            HttpServletRequest httpRequest) {
        Long adminId = extractUserId(httpRequest);
        UserDTO newUser = userManagementService.createUser(adminId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "User created successfully", newUser));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers(HttpServletRequest httpRequest) {
        Long adminId = extractUserId(httpRequest);
        List<UserDTO> users = userManagementService.getAllUsersInOrganization(adminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Users retrieved", users));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {
        UserDTO updatedUser = userManagementService.updateUser(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "User updated successfully", updatedUser));
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
