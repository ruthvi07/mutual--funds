package com.mutualfunds.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AdminDtos {

    public record ComplaintResponse(
            Long id,
            Long userId,
            String userName,
            String message,
            String status
    ) {}

    public record ComplianceAlert(
            String title,
            String description,
            String severity
    ) {}

    public record DashboardResponse(
            Integer advisorsPending,
            Integer complaintsOpen,
            Integer fraudAlerts,
            Integer fundsUpdated,
            Integer misSellingFlags,
            Double unclaimedAmountCr,
            Integer liveFundsCovered,
            List<ComplianceAlert> complianceAlerts,
            List<AuthDtos.UserResponse> advisors,
            List<ComplaintResponse> complaints
    ) {}

    public record ComplaintUpdateRequest(
            @NotBlank String status
    ) {}

    public record UserStatusUpdateRequest(
            @NotBlank String status
    ) {}
}
