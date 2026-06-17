package com.example.group_task_spring_boot.service;

import com.example.group_task_spring_boot.dto.LoginRequest;
import com.example.group_task_spring_boot.dto.SignUpRequest;
import com.example.group_task_spring_boot.dto.UserResponse;
import com.example.group_task_spring_boot.entity.User;
import com.example.group_task_spring_boot.entity.UserRole;
import com.example.group_task_spring_boot.exception.BadRequestException;
import com.example.group_task_spring_boot.exception.UnauthorizedException;
import com.example.group_task_spring_boot.repository.UserRepository;
import com.example.group_task_spring_boot.repository.UserRoleRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    // In-memory thread-safe session storage mapping tokens to users
    private final Map<String, User> sessions = new ConcurrentHashMap<>();

    public UserResponse signUp(SignUpRequest request) {
        // Validation rules check
        if (request.getUsername().trim().isEmpty()) {
            throw new BadRequestException("Username is required.");
        }
        if (request.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required.");
        }
        if (request.getPassword().length() < 6) {
            throw new BadRequestException("Password must contain at least 6 characters.");
        }

        // Email format check
        if (!request.getEmail().matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            throw new BadRequestException("Invalid email format.");
        }

        // Uniqueness check
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists.");
        }

        // Save new user
        String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());
        
        UserRole customerRole = userRoleRepository.findByName("khách hàng")
                .orElseGet(() -> userRoleRepository.save(UserRole.builder().name("khách hàng").build()));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(hashedPassword)
                .role(customerRole)
                .build();

        User savedUser = userRepository.save(user);
        String token = generateSession(savedUser);

        return UserResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .token(token)
                .role(savedUser.getRole() != null ? savedUser.getRole().getName() : null)
                .build();
    }

    public UserResponse login(LoginRequest request) {
        // Find user by email or username
        User user = userRepository.findByEmailOrUsername(request.getEmailOrUsername(), request.getEmailOrUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        // Verify password
        if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        String token = generateSession(user);

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .token(token)
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .build();
    }

    public void logout(String token) {
        String cleanedToken = cleanToken(token);
        if (cleanedToken != null) {
            sessions.remove(cleanedToken);
        }
    }

    public User validateTokenAndGetUser(String token) {
        String cleanedToken = cleanToken(token);
        if (cleanedToken == null || !sessions.containsKey(cleanedToken)) {
            throw new UnauthorizedException("Unauthorized: Invalid session token.");
        }
        return sessions.get(cleanedToken);
    }

    private String generateSession(User user) {
        String token = UUID.randomUUID().toString();
        sessions.put(token, user);
        return token;
    }

    private String cleanToken(String token) {
        if (token == null) return null;
        if (token.startsWith("Bearer ")) {
            return token.substring(7).trim();
        }
        return token.trim();
    }
}
