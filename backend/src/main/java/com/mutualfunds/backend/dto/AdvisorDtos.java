package com.mutualfunds.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AdvisorDtos {

    public record EducationPostRequest(
            @NotNull Long advisorId,
            @NotBlank String title,
            @NotBlank String postType,
            @NotBlank String summary
    ) {}

    public record EducationPostResponse(
            Long id,
            Long advisorId,
            String title,
            String postType,
            String summary,
            Integer likesCount,
            List<String> comments
    ) {}

    public record ClientSnapshot(
            Long userId,
            String name,
            Double investedAmount,
            Double currentValue,
            String profileHint
    ) {}

    public record AdvisorAction(
            String title,
            String explanation
    ) {}

    public record AdvisorDashboardResponse(
            Integer activeClients,
            Integer recommendationsSent,
            Integer riskReports,
            List<AdvisorAction> actions,
            List<ClientSnapshot> clients,
            List<EducationPostResponse> posts
    ) {}
}
