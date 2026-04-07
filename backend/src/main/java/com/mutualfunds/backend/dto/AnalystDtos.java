package com.mutualfunds.backend.dto;

import java.util.List;
import java.util.Map;

public class AnalystDtos {

    public record AnalystInsight(
            String title,
            String explanation,
            String action
    ) {}

    public record FundHighlight(
            Long id,
            String name,
            String riskLevel,
            Double recommendationScore,
            String recommendationLabel,
            Double returns3Y,
            Double expenseRatio,
            Double latestNav,
            String reason
    ) {}

    public record AnalystDashboardResponse(
            Double averageOneYearReturn,
            Double averageSharpeRatio,
            Double totalAumCr,
            Integer fundsTracked,
            Integer liveFundsTracked,
            String easiestSummary,
            String marketView,
            List<Double> monteCarloSeries,
            Map<String, Double> categoryReturns,
            List<AnalystInsight> beginnerInsights,
            List<FundHighlight> topFunds
    ) {}
}
