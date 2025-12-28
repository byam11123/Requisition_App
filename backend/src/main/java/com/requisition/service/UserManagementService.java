package com.requisition.service;

import com.requisition.dto.CreateUserRequest;
import com.requisition.dto.UpdateUserRequest;
import com.requisition.dto.UserDTO;
import com.requisition.entity.User;
import com.requisition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserManagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDTO createUser(Long adminUserId, CreateUserRequest request) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Only admins can create users");
        }

        // Validate email format
        if (!isValidEmail(request.getEmail())) {
            throw new RuntimeException("Invalid email format");
        }

        // Check for duplicate email
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Validate password complexity
        if (!isValidPassword(request.getPassword())) {
            throw new RuntimeException(
                    "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character");
        }

        User newUser = new User();
        newUser.setOrganization(admin.getOrganization());
        newUser.setEmail(request.getEmail());
        newUser.setFullName(request.getFullName());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(User.UserRole.valueOf(request.getRole()));
        newUser.setDesignation(request.getDesignation());
        newUser.setDepartment(request.getDepartment());
        newUser.setActive(true);

        userRepository.save(newUser);

        return convertToDTO(newUser);
    }

    public List<UserDTO> getAllUsersInOrganization(Long adminUserId) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userRepository.findAll().stream()
                .filter(u -> u.getOrganization().getId().equals(admin.getOrganization().getId()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUser(Long adminUserId, Long userId, UpdateUserRequest request) {
        // Verify admin privileges
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Only admins can update users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify both users are in the same organization
        if (!user.getOrganization().getId().equals(admin.getOrganization().getId())) {
            throw new RuntimeException("Cannot update users from different organizations");
        }

        if (request.getFullName() != null)
            user.setFullName(request.getFullName());
        if (request.getRole() != null)
            user.setRole(User.UserRole.valueOf(request.getRole()));
        if (request.getDesignation() != null)
            user.setDesignation(request.getDesignation());
        if (request.getDepartment() != null)
            user.setDepartment(request.getDepartment());
        if (request.getIsActive() != null)
            user.setActive(request.getIsActive());

        userRepository.save(user);
        return convertToDTO(user);
    }

    public UserDTO toggleUserStatus(Long adminUserId, Long userId, boolean isActive) {
        // Verify admin privileges
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Only admins can change user status");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify both users are in the same organization
        if (!user.getOrganization().getId().equals(admin.getOrganization().getId())) {
            throw new RuntimeException("Cannot modify users from different organizations");
        }

        // Prevent admin from deactivating themselves
        if (userId.equals(adminUserId)) {
            throw new RuntimeException("Cannot deactivate your own account");
        }

        user.setActive(isActive);
        userRepository.save(user);
        return convertToDTO(user);
    }

    public void deleteUser(Long adminUserId, Long userId) {
        // Verify admin privileges
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("Only admins can delete users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify both users are in the same organization
        if (!user.getOrganization().getId().equals(admin.getOrganization().getId())) {
            throw new RuntimeException("Cannot delete users from different organizations");
        }

        // Prevent admin from deleting themselves
        if (userId.equals(adminUserId)) {
            throw new RuntimeException("Cannot delete your own account");
        }

        userRepository.delete(user);
    }

    public void changePassword(Long userId, com.requisition.dto.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password complexity
        if (!isValidPassword(request.getNewPassword())) {
            throw new RuntimeException(
                    "New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character");
        }

        // Ensure new password is different from current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new RuntimeException("New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email.matches(emailRegex);
    }

    private boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        // Check for at least one uppercase, one lowercase, one digit, and one special
        // character
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(ch -> "!@#$%^&*()_+-=[]{}|;:,.<>?".indexOf(ch) >= 0);

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().toString(),
                user.getDesignation(),
                user.getDepartment(),
                user.getProfilePhotoUrl(),
                user.getOrganization().getId(),
                user.getOrganization().getName(),
                user.isActive());
    }

    @Autowired
    private FileStorageService fileStorageService;

    public UserDTO uploadProfilePhoto(Long userId, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String fileName = fileStorageService.storeFile(file);
        String fileUrl = "/api/v1/uploads/" + fileName;

        user.setProfilePhotoUrl(fileUrl);
        User updatedUser = userRepository.save(user);

        return convertToDTO(updatedUser);
    }
}
