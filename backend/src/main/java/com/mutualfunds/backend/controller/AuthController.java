package com.mutualfunds.backend.controller;

import com.mutualfunds.backend.dto.AuthDtos.GoogleLoginRequest;
import com.mutualfunds.backend.dto.AuthDtos.LoginRequest;
import com.mutualfunds.backend.dto.AuthDtos.LoginResponse;
import com.mutualfunds.backend.dto.AuthDtos.RegisterRequest;
import com.mutualfunds.backend.dto.AuthDtos.UserResponse;
import com.mutualfunds.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/google")
    public LoginResponse googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return authService.googleLogin(request);
    }
}
