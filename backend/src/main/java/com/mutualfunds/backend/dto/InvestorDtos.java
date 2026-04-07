package com.mutualfunds.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class InvestorDtos {

    public record RiskProfileRequest(
            @NotNull Integer age,
            @NotNull Double annualIncome,
            @NotNull Integer investmentDurationYears,
            @NotBlank String riskTolerance,
            @NotBlank String goal
    ) {}

    public record RiskProfileResponse(
            String profile,
            String summary,
            List<FundDtos.FundResponse> recommendedFunds
    ) {}

    public record WatchlistRequest(
            @NotNull Long userId,
            @NotNull Long fundId
    ) {}

    public record InvestRequest(
            @NotNull Long userId,
            @NotNull Long fundId,
            @NotNull Double amount,
            String mode
    ) {}

    public record InvestResponse(
            Long holdingId,
            Long fundId,
            String fundName,
            Double investedAmount,
            Double currentValue,
            Double allocationPercent,
            String message
    ) {}

    public record WatchlistItemResponse(
            Long id,
            Long fundId,
            String fundName,
            String fundType,
            String riskLevel,
            Double latestNav,
            String recommendationLabel,
            Double recommendationScore
    ) {}

    public record RecommendationResponse(
            List<FundDtos.FundResponse> topPicks,
            List<FundDtos.ModelPortfolioResponse> modelPortfolios,
            List<String> personalInsights,
            List<String> avoidReasons
    ) {}

    public record OverlapResponse(
            Map<String, Integer> overlappingCompanies,
            List<String> insights
    ) {}

    public record MonthlySummaryResponse(
            String headline,
            String bestPerformer,
            String weakestPerformer,
            String recommendedAction,
            List<String> highlights
    ) {}

    public record PortfolioHoldingResponse(
            Long fundId,
            String fundName,
            Double investedAmount,
            Double currentValue,
            Double allocationPercent
    ) {}

    public record PortfolioSummaryResponse(
            Double totalInvested,
            Double currentValue,
            Double profitLossPercent,
            Double xirr,
            Map<String, Double> assetAllocation,
            Map<String, Double> sectorAllocation,
            String portfolioHealth,
            String nextAction,
            List<String> opportunityCards,
            List<String> aiInsights,
            List<PortfolioHoldingResponse> holdings
    ) {}

    public record GoalPlanRequest(
            Long userId,
            String goalType,
            Double targetCorpus,
            Integer targetYears
    ) {}

    public record SipPlanRequest(
            Long userId,
            Long fundId,
            Double monthlyAmount,
            Integer stepUpRate,
            Boolean autoDebitEnabled,
            LocalDate nextDebitDate
    ) {}
}
