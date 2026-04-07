package com.mutualfunds.backend.service;

import com.mutualfunds.backend.domain.MutualFund;
import com.mutualfunds.backend.dto.FundDtos.FundResponse;
import com.mutualfunds.backend.dto.FundDtos.ModelPortfolioResponse;
import com.mutualfunds.backend.dto.FundDtos.NavHistoryPoint;
import com.mutualfunds.backend.dto.FundDtos.LiveSyncResponse;
import com.mutualfunds.backend.dto.FundDtos.FundUpsertRequest;
import com.mutualfunds.backend.repository.MutualFundRepository;
import com.mutualfunds.backend.repository.NavHistoryRepository;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FundService {

    private final MutualFundRepository fundRepository;
    private final NavHistoryRepository navHistoryRepository;
    private final CsvMapper csvMapper;
    private final LiveNavSyncService liveNavSyncService;

    public List<FundResponse> getAllFunds(String query) {
        List<MutualFund> funds = (query == null || query.isBlank())
                ? fundRepository.findAll()
                : fundRepository.findByNameContainingIgnoreCase(query);
        return funds.stream().map(this::toFundResponse).toList();
    }

    public FundResponse getFund(Long id) {
        return toFundResponse(fundRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fund not found")));
    }

    public FundResponse createFund(FundUpsertRequest request) {
        MutualFund fund = new MutualFund();
        applyFundRequest(fund, request);
        return toFundResponse(fundRepository.save(fund));
    }

    public FundResponse updateFund(Long id, FundUpsertRequest request) {
        MutualFund fund = fundRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Fund not found"));
        applyFundRequest(fund, request);
        return toFundResponse(fundRepository.save(fund));
    }

    public LiveSyncResponse syncLiveData() {
        return liveNavSyncService.syncNow();
    }

    public List<NavHistoryPoint> getNavHistory(Long fundId) {
        return navHistoryRepository.findTop30ByFundIdOrderByNavDateDesc(fundId).stream()
                .sorted(java.util.Comparator.comparing(history -> history.getNavDate()))
                .map(history -> new NavHistoryPoint(history.getNavDate(), history.getNav()))
                .toList();
    }

    public List<ModelPortfolioResponse> getModelPortfolios() {
        List<MutualFund> funds = fundRepository.findAll();
        return List.of(
                buildModelPortfolio(
                        "Beginner Portfolio",
                        "First-time investor",
                        "Wealth Creation",
                        "Keeps risk moderate with a mix of hybrid, index, and stable equity funds.",
                        Map.of("Hybrid", 40.0, "Index", 35.0, "Equity", 25.0),
                        shortlistFunds(funds, List.of("Hybrid", "Index", "Equity"), 3)
                ),
                buildModelPortfolio(
                        "Tax Saver Portfolio",
                        "User seeking deductions",
                        "Tax Saving",
                        "Prioritizes ELSS while keeping diversification through flexi-cap and hybrid options.",
                        Map.of("ELSS", 55.0, "Equity", 25.0, "Hybrid", 20.0),
                        shortlistFunds(funds, List.of("ELSS", "Equity", "Hybrid"), 3)
                ),
                buildModelPortfolio(
                        "Retirement Portfolio",
                        "Long-term disciplined investor",
                        "Retirement",
                        "Balances growth with smoother volatility for long investing horizons.",
                        Map.of("Equity", 45.0, "Index", 25.0, "Hybrid", 20.0, "Debt", 10.0),
                        shortlistFunds(funds, List.of("Equity", "Index", "Hybrid", "Debt"), 4)
                ),
                buildModelPortfolio(
                        "Low-Risk Income Portfolio",
                        "Cautious investor",
                        "Income",
                        "Focuses on lower-volatility categories and predictable portfolio behavior.",
                        Map.of("Debt", 50.0, "Hybrid", 35.0, "Index", 15.0),
                        shortlistFunds(funds, List.of("Debt", "Hybrid", "Index"), 3)
                )
        );
    }

    private void applyFundRequest(MutualFund fund, FundUpsertRequest request) {
        fund.setName(request.name());
        fund.setCategory(request.category());
        fund.setFundType(request.fundType());
        fund.setRiskLevel(request.riskLevel());
        fund.setReturns1Y(request.returns1Y());
        fund.setReturns3Y(request.returns3Y());
        fund.setReturns5Y(request.returns5Y());
        fund.setExpenseRatio(request.expenseRatio());
        fund.setAumCr(request.aumCr());
        fund.setAvgMonthlyIncome(request.avgMonthlyIncome());
        fund.setRoiScore(request.roiScore());
        fund.setRating(request.rating());
        fund.setReviewCount(request.reviewCount());
        fund.setFundManager(request.fundManager());
        fund.setExitLoad(request.exitLoad());
        fund.setLockInPeriod(request.lockInPeriod());
        fund.setContractType(request.contractType());
        fund.setFundHouse(request.fundHouse());
        fund.setCompaniesCsv(csvMapper.joinStrings(request.companies()));
        fund.setSectorAllocationJson(csvMapper.mapToJsonish(request.sectorAllocation()));
        fund.setGrowthPointsCsv(csvMapper.joinDoubles(request.growthPoints()));
        Map<String, Double> riskMetrics = request.riskMetrics();
        fund.setStandardDeviation(riskMetrics.getOrDefault("stdDev", 0.0));
        fund.setBeta(riskMetrics.getOrDefault("beta", 0.0));
        fund.setSharpeRatio(riskMetrics.getOrDefault("sharpe", 0.0));
        fund.setAlpha(riskMetrics.getOrDefault("alpha", 0.0));
        fund.setReviewsCsv(csvMapper.joinStrings(request.reviews()));
    }

    public FundResponse toFundResponse(MutualFund fund) {
        double recommendationScore = calculateRecommendationScore(fund);
        String recommendationLabel = recommendationLabel(recommendationScore, fund);
        String recommendationReason = buildRecommendationReason(fund, recommendationScore);

        return new FundResponse(
                fund.getId(),
                fund.getSchemeCode(),
                fund.getName(),
                fund.getCategory(),
                fund.getFundType(),
                fund.getRiskLevel(),
                fund.getReturns1Y(),
                fund.getReturns3Y(),
                fund.getReturns5Y(),
                fund.getExpenseRatio(),
                fund.getAumCr(),
                fund.getAvgMonthlyIncome(),
                fund.getRoiScore(),
                fund.getRating(),
                fund.getReviewCount(),
                fund.getFundManager(),
                fund.getExitLoad(),
                fund.getLockInPeriod(),
                fund.getContractType(),
                fund.getFundHouse(),
                fund.getLatestNav(),
                fund.getLatestNavDate(),
                fund.getLastSyncedAt(),
                fund.getDataSource(),
                recommendationScore,
                recommendationLabel,
                recommendationReason,
                fund.getLatestNav() != null,
                csvMapper.splitStrings(fund.getCompaniesCsv()),
                csvMapper.jsonishToMap(fund.getSectorAllocationJson()),
                csvMapper.splitDoubles(fund.getGrowthPointsCsv()),
                Map.of(
                        "stdDev", fund.getStandardDeviation(),
                        "beta", fund.getBeta(),
                        "sharpe", fund.getSharpeRatio(),
                        "alpha", fund.getAlpha()
                ),
                csvMapper.splitStrings(fund.getReviewsCsv())
        );
    }

    private double calculateRecommendationScore(MutualFund fund) {
        double score = 0;
        score += fund.getReturns3Y() * 2.2;
        score += fund.getReturns5Y() * 1.8;
        score += fund.getRating() * 9.0;
        score += fund.getSharpeRatio() * 12.0;
        score -= fund.getExpenseRatio() * 18.0;
        score -= Math.max(0, fund.getBeta() - 1.0) * 8.0;
        score -= Math.max(0, fund.getStandardDeviation() - 12.0) * 0.8;
        if ("Hybrid".equalsIgnoreCase(fund.getFundType()) || "Debt".equalsIgnoreCase(fund.getFundType())) {
            score += 4.0;
        }
        if (fund.getLatestNav() != null) {
            score += 2.0;
        }
        return Math.round(score * 10.0) / 10.0;
    }

    private String recommendationLabel(double score, MutualFund fund) {
        if (score >= 95) {
            return "Top Pick";
        }
        if (score >= 82) {
            return "Strong Fit";
        }
        if ("Debt".equalsIgnoreCase(fund.getFundType()) || "Hybrid".equalsIgnoreCase(fund.getFundType())) {
            return "Safer Option";
        }
        return "Watch Carefully";
    }

    private String buildRecommendationReason(MutualFund fund, double score) {
        if (score >= 95) {
            return "Strong long-term returns, healthy rating, and manageable cost make this one of the best overall options.";
        }
        if ("Debt".equalsIgnoreCase(fund.getFundType()) || "Hybrid".equalsIgnoreCase(fund.getFundType())) {
            return "Useful for investors who want a smoother ride with lower volatility than pure equity funds.";
        }
        if (fund.getExpenseRatio() > 1.0) {
            return "Returns are decent, but cost is relatively high. Compare before investing.";
        }
        if (fund.getRiskLevel().toLowerCase().contains("high")) {
            return "Higher upside potential, but expect sharper swings. Best for long-term investors with higher risk capacity.";
        }
        return "Balanced return profile with reasonable cost. A practical shortlist candidate for most investors.";
    }

    private ModelPortfolioResponse buildModelPortfolio(
            String name,
            String targetUser,
            String goalType,
            String summary,
            Map<String, Double> allocation,
            List<FundResponse> suggestedFunds
    ) {
        return new ModelPortfolioResponse(name, targetUser, goalType, summary, allocation, suggestedFunds);
    }

    private List<FundResponse> shortlistFunds(List<MutualFund> funds, List<String> allowedTypes, int limit) {
        return funds.stream()
                .filter(fund -> allowedTypes.contains(fund.getFundType()))
                .sorted(java.util.Comparator.comparingDouble(this::calculateRecommendationScore).reversed())
                .limit(limit)
                .map(this::toFundResponse)
                .toList();
    }
}
