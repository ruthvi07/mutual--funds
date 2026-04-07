package com.mutualfunds.backend.service;

import com.mutualfunds.backend.domain.MutualFund;
import com.mutualfunds.backend.dto.AnalystDtos.AnalystDashboardResponse;
import com.mutualfunds.backend.dto.AnalystDtos.AnalystInsight;
import com.mutualfunds.backend.dto.AnalystDtos.FundHighlight;
import com.mutualfunds.backend.dto.AnalystDtos.AnalystDashboardResponse;
import com.mutualfunds.backend.repository.MutualFundRepository;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnalystService {

    private final MutualFundRepository fundRepository;
    private final FundService fundService;

    public AnalystDashboardResponse getDashboard() {
        var funds = fundRepository.findAll();
        double averageOneYearReturn = funds.stream().mapToDouble(fund -> fund.getReturns1Y()).average().orElse(0);
        double averageSharpe = funds.stream().mapToDouble(fund -> fund.getSharpeRatio()).average().orElse(0);
        double totalAum = funds.stream().mapToDouble(fund -> fund.getAumCr()).sum();
        int liveFundsTracked = (int) funds.stream().filter(fund -> fund.getLatestNav() != null).count();

        Map<String, Double> categoryReturns = new LinkedHashMap<>();
        funds.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        MutualFund::getCategory,
                        LinkedHashMap::new,
                        java.util.stream.Collectors.averagingDouble(MutualFund::getReturns3Y)
                ))
                .forEach(categoryReturns::put);

        List<Double> monteCarlo = List.of(100.0, 103.0, 107.0, 109.0, 113.0, 111.0, 118.0, 121.0, 125.0, 129.0, 132.0, 138.0);
        List<MutualFund> ranked = funds.stream()
                .sorted(Comparator.comparingDouble(this::scoreFund).reversed())
                .toList();

        List<AnalystInsight> beginnerInsights = buildInsights(funds, averageOneYearReturn, averageSharpe);
        List<FundHighlight> topFunds = ranked.stream()
                .limit(4)
                .map(fund -> {
                    var response = fundService.toFundResponse(fund);
                    return new FundHighlight(
                            fund.getId(),
                            fund.getName(),
                            fund.getRiskLevel(),
                            response.recommendationScore(),
                            response.recommendationLabel(),
                            fund.getReturns3Y(),
                            fund.getExpenseRatio(),
                            fund.getLatestNav(),
                            response.recommendationReason()
                    );
                })
                .toList();

        String easiestSummary = buildSummary(funds, averageOneYearReturn, liveFundsTracked);
        String marketView = averageOneYearReturn >= 18
                ? "Returns are strong overall. Good time to shortlist, but still compare cost and risk."
                : averageOneYearReturn >= 12
                ? "Market conditions are balanced. Focus on quality funds and long-term goals."
                : "Returns are softer right now. Safer and diversified funds may be more comfortable for new investors.";

        return new AnalystDashboardResponse(
                averageOneYearReturn,
                averageSharpe,
                totalAum,
                funds.size(),
                liveFundsTracked,
                easiestSummary,
                marketView,
                monteCarlo,
                categoryReturns,
                beginnerInsights,
                topFunds
        );
    }

    private List<AnalystInsight> buildInsights(List<MutualFund> funds, double averageOneYearReturn, double averageSharpe) {
        MutualFund safest = funds.stream()
                .min(Comparator.comparingDouble(fund -> fund.getStandardDeviation() + Math.max(0, fund.getBeta() - 1)))
                .orElse(null);
        MutualFund cheapest = funds.stream()
                .min(Comparator.comparingDouble(MutualFund::getExpenseRatio))
                .orElse(null);
        MutualFund strongest = funds.stream()
                .max(Comparator.comparingDouble(MutualFund::getReturns3Y))
                .orElse(null);

        return List.of(
                new AnalystInsight(
                        "Average return is healthy",
                        String.format("Across tracked funds, the average 1-year return is %.2f%%.", averageOneYearReturn),
                        "Use this as a market baseline. Prefer funds comfortably above the average only when their risk is acceptable."
                ),
                new AnalystInsight(
                        "Risk-adjusted quality matters",
                        String.format("Average Sharpe ratio is %.2f. Higher values usually mean return quality is better, not just return size.", averageSharpe),
                        "When two funds have similar returns, prefer the one with the better Sharpe ratio and lower cost."
                ),
                new AnalystInsight(
                        "Safest current option",
                        safest == null ? "No safety signal available." : safest.getName() + " currently looks easier to hold because volatility is lower.",
                        "Good for cautious investors or first-time SIP users."
                ),
                new AnalystInsight(
                        "Best value signal",
                        cheapest == null || strongest == null
                                ? "Value comparison is unavailable."
                                : cheapest.getName() + " is the cheapest fund, while " + strongest.getName() + " leads on 3-year return.",
                        "This helps users balance low cost versus high growth."
                )
        );
    }

    private String buildSummary(List<MutualFund> funds, double averageOneYearReturn, int liveFundsTracked) {
        MutualFund leader = funds.stream()
                .max(Comparator.comparingDouble(MutualFund::getReturns3Y))
                .orElse(null);
        if (leader == null) {
            return "No fund data is available yet.";
        }
        return String.format(
                "%s is the strongest medium-term performer in the current dataset. %d funds already have live NAV from AMFI, and the average 1-year return is %.2f%%.",
                leader.getName(),
                liveFundsTracked,
                averageOneYearReturn
        );
    }

    private double scoreFund(MutualFund fund) {
        return fund.getReturns3Y() * 2.2
                + fund.getReturns5Y() * 1.8
                + fund.getRating() * 9
                + fund.getSharpeRatio() * 12
                - fund.getExpenseRatio() * 18
                - Math.max(0, fund.getBeta() - 1.0) * 8;
    }
}
