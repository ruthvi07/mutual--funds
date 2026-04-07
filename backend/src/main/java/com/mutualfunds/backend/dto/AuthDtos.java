package com.mutualfunds.backend.dto;

import com.mutualfunds.backend.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String mobile,
            @NotNull UserRole role
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record GoogleLoginRequest(
            @NotBlank String idToken
    ) {}

    public record UserResponse(
            Long id,
            String fullName,
            String email,
            String mobile,
            UserRole role,
            String status
    ) {}

    public record LoginResponse(
            String message,
            UserResponse user
    ) {}
}
