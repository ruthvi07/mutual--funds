package com.mutualfunds.backend.service;

import com.mutualfunds.backend.domain.AppUser;
import com.mutualfunds.backend.domain.UserRole;
import com.mutualfunds.backend.dto.AuthDtos.GoogleLoginRequest;
import com.mutualfunds.backend.dto.AuthDtos.LoginRequest;
import com.mutualfunds.backend.dto.AuthDtos.LoginResponse;
import com.mutualfunds.backend.dto.AuthDtos.RegisterRequest;
import com.mutualfunds.backend.dto.AuthDtos.UserResponse;
import com.mutualfunds.backend.repository.AppUserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository userRepository;
    private final FirebaseTokenVerifier firebaseTokenVerifier;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        userRepository.findByEmail(email).ifPresent(existing -> {
            throw new IllegalArgumentException("Email already registered");
        });

        AppUser user = new AppUser();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setMobile(request.mobile().trim());
        user.setRole(request.role());
        user.setStatus("ACTIVE");
        return toUserResponse(userRepository.save(user));
    }

    public LoginResponse login(LoginRequest request) {
        AppUser user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return new LoginResponse("Login successful", toUserResponse(user));
    }

    public LoginResponse googleLogin(GoogleLoginRequest request) {
        var token = firebaseTokenVerifier.verify(request.idToken());
        String tokenEmail = token.getEmail();
        if (tokenEmail == null || tokenEmail.isBlank()) {
            throw new IllegalArgumentException("Google account email not available");
        }

        final String email = normalizeEmail(tokenEmail);

        AppUser user = userRepository.findByEmail(email)
                .orElseGet(() -> createGoogleUser(token.getName(), email));

        return new LoginResponse("Google login successful", toUserResponse(user));
    }

    private AppUser createGoogleUser(String fullName, @NonNull String email) {
        AppUser user = new AppUser();
        user.setFullName((fullName == null || fullName.isBlank()) ? "Google User" : fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("firebase-google-auth"));
        user.setMobile("0000000000");
        user.setRole(UserRole.INVESTOR);
        user.setStatus("ACTIVE");
        return userRepository.save(user);
    }

    public static UserResponse toUserResponse(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getMobile(),
                user.getRole(),
                user.getStatus()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
