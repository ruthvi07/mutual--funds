package com.mutualfunds.backend.controller;

import com.mutualfunds.backend.dto.AdminDtos.ComplaintUpdateRequest;
import com.mutualfunds.backend.dto.AdminDtos.DashboardResponse;
import com.mutualfunds.backend.dto.AdminDtos.UserStatusUpdateRequest;
import com.mutualfunds.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public DashboardResponse getDashboard() {
        return adminService.getDashboard();
    }

    @PutMapping("/complaints/{id}")
    public void updateComplaint(@PathVariable Long id, @Valid @RequestBody ComplaintUpdateRequest request) {
        adminService.updateComplaintStatus(id, request.status());
    }

    @PutMapping("/users/{id}")
    public void updateUserStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequest request) {
        adminService.updateUserStatus(id, request.status());
    }
}
