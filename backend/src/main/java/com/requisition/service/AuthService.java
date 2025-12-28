package com.requisition.service;

import com.requisition.dto.*;
import com.requisition.entity.*;
import com.requisition.repository.*;
import com.requisition.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Check if user account is active
        if (!user.isActive()) {
            throw new RuntimeException("Account has been deactivated. Please contact your administrator.");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());

        return new AuthResponse(token, refreshToken, convertToDTO(user));
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
                user.getOrganization() != null ? user.getOrganization().getId() : null,
                user.getOrganization() != null ? user.getOrganization().getName() : null,
                user.isActive());
    }
}
