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

    public UserDTO updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().toString(),
                user.getDesignation(),
                user.getDepartment(),
                user.getOrganization().getId(),
                user.getOrganization().getName());
    }
}
