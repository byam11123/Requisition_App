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
            @RequestBody UpdateUserRequest request,
            HttpServletRequest httpRequest) {
        Long adminId = extractUserId(httpRequest);
        UserDTO updatedUser = userManagementService.updateUser(adminId, id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "User updated successfully", updatedUser));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<UserDTO>> deactivateUser(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        Long adminId = extractUserId(httpRequest);
        UserDTO user = userManagementService.toggleUserStatus(adminId, id, false);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deactivated successfully", user));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<UserDTO>> activateUser(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        Long adminId = extractUserId(httpRequest);
        UserDTO user = userManagementService.toggleUserStatus(adminId, id, true);
        return ResponseEntity.ok(new ApiResponse<>(true, "User activated successfully", user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        Long adminId = extractUserId(httpRequest);
        userManagementService.deleteUser(adminId, id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody com.requisition.dto.ChangePasswordRequest request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        userManagementService.changePassword(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully", null));
    }

    private Long extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Unauthorized");
    }

    @PostMapping("/profile-photo")
    public ResponseEntity<ApiResponse<UserDTO>> uploadProfilePhoto(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        UserDTO updatedUser = userManagementService.uploadProfilePhoto(userId, file);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile photo uploaded successfully", updatedUser));
    }

}
