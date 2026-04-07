package com.mutualfunds.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class FundDtos {

    public record FundResponse(
            Long id,
            String schemeCode,
            String name,
            String category,
            String fundType,
            String riskLevel,
            Double returns1Y,
            Double returns3Y,
            Double returns5Y,
            Double expenseRatio,
            Double aumCr,
            Integer avgMonthlyIncome,
            Integer roiScore,
            Double rating,
            Integer reviewCount,
            String fundManager,
            String exitLoad,
            String lockInPeriod,
            String contractType,
            String fundHouse,
            Double latestNav,
            LocalDate latestNavDate,
            LocalDateTime lastSyncedAt,
            String dataSource,
            Double recommendationScore,
            String recommendationLabel,
            String recommendationReason,
            boolean liveDataAvailable,
            List<String> companies,
            Map<String, Double> sectorAllocation,
            List<Double> growthPoints,
            Map<String, Double> riskMetrics,
            List<String> reviews
    ) {}

    public record LiveSyncResponse(
            String source,
            LocalDateTime syncedAt,
            Integer recordsProcessed,
            Integer fundsMatched,
            String message
    ) {}

    public record NavHistoryPoint(
            LocalDate date,
            Double nav
    ) {}

    public record FundComparisonInsight(
            String title,
            String explanation
    ) {}

    public record ModelPortfolioResponse(
            String name,
            String targetUser,
            String goalType,
            String summary,
            Map<String, Double> allocation,
            List<FundResponse> suggestedFunds
    ) {}

    public record FundUpsertRequest(
            @NotBlank String name,
            @NotBlank String category,
            @NotBlank String fundType,
            @NotBlank String riskLevel,
            @NotNull Double returns1Y,
            @NotNull Double returns3Y,
            @NotNull Double returns5Y,
            @NotNull Double expenseRatio,
            @NotNull Double aumCr,
            @NotNull Integer avgMonthlyIncome,
            @NotNull Integer roiScore,
            @NotNull Double rating,
            @NotNull Integer reviewCount,
            @NotBlank String fundManager,
            @NotBlank String exitLoad,
            @NotBlank String lockInPeriod,
            @NotBlank String contractType,
            @NotBlank String fundHouse,
            @NotNull List<String> companies,
            @NotNull Map<String, Double> sectorAllocation,
            @NotNull List<Double> growthPoints,
            @NotNull Map<String, Double> riskMetrics,
            @NotNull List<String> reviews
    ) {}
}
