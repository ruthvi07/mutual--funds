package com.mutualfunds.backend.service;

import com.mutualfunds.backend.domain.AppUser;
import com.mutualfunds.backend.domain.GoalPlan;
import com.mutualfunds.backend.domain.MutualFund;
import com.mutualfunds.backend.domain.PortfolioHolding;
import com.mutualfunds.backend.domain.SipPlan;
import com.mutualfunds.backend.domain.WatchlistItem;
import com.mutualfunds.backend.dto.FundDtos.FundResponse;
import com.mutualfunds.backend.dto.FundDtos.ModelPortfolioResponse;
import com.mutualfunds.backend.dto.InvestorDtos.GoalPlanRequest;
import com.mutualfunds.backend.dto.InvestorDtos.InvestRequest;
import com.mutualfunds.backend.dto.InvestorDtos.InvestResponse;
import com.mutualfunds.backend.dto.InvestorDtos.MonthlySummaryResponse;
import com.mutualfunds.backend.dto.InvestorDtos.OverlapResponse;
import com.mutualfunds.backend.dto.InvestorDtos.PortfolioHoldingResponse;
import com.mutualfunds.backend.dto.InvestorDtos.PortfolioSummaryResponse;
import com.mutualfunds.backend.dto.InvestorDtos.RecommendationResponse;
import com.mutualfunds.backend.dto.InvestorDtos.RiskProfileRequest;
import com.mutualfunds.backend.dto.InvestorDtos.RiskProfileResponse;
import com.mutualfunds.backend.dto.InvestorDtos.SipPlanRequest;
import com.mutualfunds.backend.dto.InvestorDtos.WatchlistItemResponse;
import com.mutualfunds.backend.repository.AppUserRepository;
import com.mutualfunds.backend.repository.GoalPlanRepository;
import com.mutualfunds.backend.repository.MutualFundRepository;
import com.mutualfunds.backend.repository.PortfolioHoldingRepository;
import com.mutualfunds.backend.repository.SipPlanRepository;
import com.mutualfunds.backend.repository.WatchlistItemRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InvestorService {

    private final MutualFundRepository fundRepository;
    private final PortfolioHoldingRepository holdingRepository;
    private final GoalPlanRepository goalPlanRepository;
    private final SipPlanRepository sipPlanRepository;
    private final AppUserRepository userRepository;
    private final WatchlistItemRepository watchlistItemRepository;
    private final FundService fundService;
    private final CsvMapper csvMapper;

    public RiskProfileResponse calculateRiskProfile(RiskProfileRequest request) {
        int score = 0;
        if (request.age() < 30) score += 2;
        else if (request.age() < 45) score += 1;
        if (request.annualIncome() > 1_800_000) score += 2;
        else if (request.annualIncome() > 800_000) score += 1;
        if (request.investmentDurationYears() >= 8) score += 2;
        else if (request.investmentDurationYears() >= 4) score += 1;
        if ("High".equalsIgnoreCase(request.riskTolerance())) score += 2;
        else if ("Medium".equalsIgnoreCase(request.riskTolerance())) score += 1;
        if ("Retirement".equalsIgnoreCase(request.goal()) || "Wealth Creation".equalsIgnoreCase(request.goal())) score += 1;

        String profile = score >= 7 ? "Aggressive" : score >= 4 ? "Moderate" : "Conservative";

        List<MutualFund> eligible = fundRepository.findAll().stream()
                .filter(fund -> matchesProfile(profile, fund))
                .sorted(Comparator.comparingDouble(this::recommendationScore).reversed())
                .limit(4)
                .toList();

        List<FundResponse> recommendations = eligible.stream().map(fundService::toFundResponse).toList();
        return new RiskProfileResponse(profile, profileSummary(profile), recommendations);
    }

    public PortfolioSummaryResponse getPortfolioSummary(Long userId) {
        List<PortfolioHolding> holdings = holdingRepository.findByUserId(userId);
        double totalInvested = holdings.stream().mapToDouble(PortfolioHolding::getInvestedAmount).sum();
        double currentValue = holdings.stream().mapToDouble(PortfolioHolding::getCurrentValue).sum();
        double pnl = totalInvested == 0 ? 0 : ((currentValue - totalInvested) / totalInvested) * 100;
        double xirr = totalInvested == 0 ? 0 : (Math.pow(currentValue / totalInvested, 1.0 / 3) - 1) * 100;

        Map<String, Double> assetAllocation = new HashMap<>();
        Map<String, Double> sectorAllocation = new HashMap<>();
        List<String> aiInsights = new ArrayList<>();

        for (PortfolioHolding holding : holdings) {
            MutualFund fund = holding.getFund();
            assetAllocation.merge(fund.getFundType(), holding.getAllocationPercent(), Double::sum);
            csvMapper.jsonishToMap(fund.getSectorAllocationJson())
                    .forEach((sector, value) -> sectorAllocation.merge(sector, value / holdings.size(), Double::sum));
        }

        double equityExposure = assetAllocation.getOrDefault("Equity", 0.0) + assetAllocation.getOrDefault("ELSS", 0.0);
        if (equityExposure >= 80) {
            aiInsights.add("Your portfolio is over 80% equity. Consider diversifying.");
        }
        if (sectorAllocation.getOrDefault("Banking", 0.0) > 35) {
            aiInsights.add("You are overexposed to banking sector.");
        }
        holdings.stream()
                .map(PortfolioHolding::getFund)
                .filter(fund -> fund.getReturns3Y() < 10)
                .findFirst()
                .ifPresent(fund -> aiInsights.add(fund.getName() + " is underperforming compared to category average."));
        if (aiInsights.isEmpty()) {
            aiInsights.add("Portfolio allocation looks balanced for your current mix.");
        }

        String portfolioHealth = pnl >= 12
                ? "Healthy"
                : pnl >= 5
                ? "Stable"
                : "Needs Attention";
        String nextAction = equityExposure >= 80
                ? "Reduce concentration by adding one hybrid or debt fund."
                : holdings.isEmpty()
                ? "Start with a SIP in one fund that matches your risk profile."
                : "Continue SIPs and review the lowest-quality holding before adding more funds.";
        List<String> opportunityCards = new ArrayList<>();
        if (holdings.stream().noneMatch(holding -> "ELSS".equalsIgnoreCase(holding.getFund().getFundType()))) {
            opportunityCards.add("You do not currently hold an ELSS fund. This may be a missed tax-saving opportunity.");
        }
        if (holdings.stream().noneMatch(holding -> "Debt".equalsIgnoreCase(holding.getFund().getFundType()))) {
            opportunityCards.add("Your portfolio has no debt allocation. Adding a debt fund can reduce volatility.");
        }
        holdings.stream()
                .max(Comparator.comparingDouble(holding -> holding.getCurrentValue() - holding.getInvestedAmount()))
                .ifPresent(holding -> opportunityCards.add(holding.getFund().getName() + " is your current best performer."));
        if (opportunityCards.isEmpty()) {
            opportunityCards.add("Your mix looks balanced. Continue SIPs and review monthly.");
        }

        List<PortfolioHoldingResponse> items = holdings.stream()
                .map(holding -> new PortfolioHoldingResponse(
                        holding.getFund().getId(),
                        holding.getFund().getName(),
                        holding.getInvestedAmount(),
                        holding.getCurrentValue(),
                        holding.getAllocationPercent()
                ))
                .toList();

        return new PortfolioSummaryResponse(totalInvested, currentValue, pnl, xirr, assetAllocation, sectorAllocation, portfolioHealth, nextAction, opportunityCards, aiInsights, items);
    }

    public GoalPlan createGoalPlan(GoalPlanRequest request) {
        AppUser user = getUser(request.userId());
        GoalPlan plan = new GoalPlan();
        plan.setUser(user);
        plan.setGoalType(request.goalType());
        plan.setTargetCorpus(request.targetCorpus());
        plan.setTargetYears(request.targetYears());

        double monthlyRate = 0.12 / 12;
        int months = request.targetYears() * 12;
        double requiredSip = request.targetCorpus() / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
        plan.setRequiredMonthlySip(requiredSip);
        plan.setExpectedCorpus(request.targetCorpus());
        return goalPlanRepository.save(plan);
    }

    public InvestResponse invest(InvestRequest request) {
        if (request.amount() == null || request.amount() <= 0) {
            throw new IllegalArgumentException("Investment amount must be greater than zero");
        }

        AppUser user = getUser(request.userId());
        MutualFund fund = fundRepository.findById(request.fundId())
                .orElseThrow(() -> new IllegalArgumentException("Fund not found"));

        PortfolioHolding holding = holdingRepository.findByUserIdAndFundId(user.getId(), fund.getId())
                .orElseGet(() -> {
                    PortfolioHolding item = new PortfolioHolding();
                    item.setUser(user);
                    item.setFund(fund);
                    item.setInvestedAmount(0.0);
                    item.setCurrentValue(0.0);
                    item.setAllocationPercent(0.0);
                    return item;
                });

        double previousInvested = holding.getInvestedAmount() == null ? 0.0 : holding.getInvestedAmount();
        double previousCurrent = holding.getCurrentValue() == null ? 0.0 : holding.getCurrentValue();
        double growthFactor = fund.getLatestNav() != null ? 1.0 : 1.02;
        double investedNow = previousInvested + request.amount();
        double currentNow = previousCurrent + (request.amount() * growthFactor);

        holding.setInvestedAmount(investedNow);
        holding.setCurrentValue(currentNow);
        PortfolioHolding saved = holdingRepository.save(holding);

        rebalanceAllocations(user.getId());
        PortfolioHolding updated = holdingRepository.findById(saved.getId()).orElse(saved);

        String mode = request.mode() == null || request.mode().isBlank() ? "Lump Sum" : request.mode();
        return new InvestResponse(
                updated.getId(),
                fund.getId(),
                fund.getName(),
                updated.getInvestedAmount(),
                updated.getCurrentValue(),
                updated.getAllocationPercent(),
                mode + " investment recorded successfully."
        );
    }

    public SipPlan createSipPlan(SipPlanRequest request) {
        SipPlan sipPlan = new SipPlan();
        sipPlan.setUser(getUser(request.userId()));
        sipPlan.setFund(fundRepository.findById(request.fundId()).orElseThrow(() -> new IllegalArgumentException("Fund not found")));
        sipPlan.setMonthlyAmount(request.monthlyAmount());
        sipPlan.setStepUpRate(request.stepUpRate());
        sipPlan.setAutoDebitEnabled(request.autoDebitEnabled());
        sipPlan.setNextDebitDate(request.nextDebitDate());
        sipPlan.setStatus("ACTIVE");
        return sipPlanRepository.save(sipPlan);
    }

    public List<WatchlistItemResponse> getWatchlist(Long userId) {
        return watchlistItemRepository.findByUserId(userId).stream()
                .map(item -> {
                    FundResponse fund = fundService.toFundResponse(item.getFund());
                    return new WatchlistItemResponse(
                            item.getId(),
                            item.getFund().getId(),
                            item.getFund().getName(),
                            item.getFund().getFundType(),
                            item.getFund().getRiskLevel(),
                            item.getFund().getLatestNav(),
                            fund.recommendationLabel(),
                            fund.recommendationScore()
                    );
                })
                .toList();
    }

    public WatchlistItemResponse addToWatchlist(Long userId, Long fundId) {
        WatchlistItem existing = watchlistItemRepository.findByUserIdAndFundId(userId, fundId).orElse(null);
        if (existing != null) {
            return getWatchlist(userId).stream().filter(item -> item.fundId().equals(fundId)).findFirst().orElseThrow();
        }
        WatchlistItem item = new WatchlistItem();
        item.setUser(getUser(userId));
        item.setFund(fundRepository.findById(fundId).orElseThrow(() -> new IllegalArgumentException("Fund not found")));
        WatchlistItem saved = watchlistItemRepository.save(item);
        FundResponse fund = fundService.toFundResponse(saved.getFund());
        return new WatchlistItemResponse(saved.getId(), saved.getFund().getId(), saved.getFund().getName(), saved.getFund().getFundType(), saved.getFund().getRiskLevel(), saved.getFund().getLatestNav(), fund.recommendationLabel(), fund.recommendationScore());
    }

    public void removeFromWatchlist(Long userId, Long fundId) {
        watchlistItemRepository.findByUserIdAndFundId(userId, fundId).ifPresent(watchlistItemRepository::delete);
    }

    public RecommendationResponse getRecommendations(Long userId) {
        List<PortfolioHolding> holdings = holdingRepository.findByUserId(userId);
        Map<String, Double> currentAllocation = new HashMap<>();
        holdings.forEach(holding -> currentAllocation.merge(holding.getFund().getFundType(), holding.getAllocationPercent(), Double::sum));

        List<FundResponse> topPicks = fundRepository.findAll().stream()
                .filter(fund -> !holdings.stream().map(PortfolioHolding::getFund).map(MutualFund::getId).toList().contains(fund.getId()))
                .sorted(Comparator.comparingDouble(this::recommendationScore).reversed())
                .limit(5)
                .map(fundService::toFundResponse)
                .toList();

        List<ModelPortfolioResponse> portfolios = fundService.getModelPortfolios();
        List<String> personalInsights = new ArrayList<>();
        if ((currentAllocation.getOrDefault("Equity", 0.0) + currentAllocation.getOrDefault("ELSS", 0.0)) > 80) {
            personalInsights.add("You already have high equity exposure, so the next fund should improve stability.");
        } else {
            personalInsights.add("You have room to add a growth-oriented fund without making the portfolio too aggressive.");
        }
        personalInsights.add("Best matches are sorted by return quality, cost, and diversification value.");
        personalInsights.add("Model portfolios can help if you want a ready-made allocation rather than choosing individual funds.");

        List<String> avoidReasons = List.of(
                "Avoid adding multiple funds that invest in the same top banking and IT stocks.",
                "Avoid high-cost funds unless they clearly outperform similar options.",
                "Avoid choosing funds only by 1-year return; medium-term consistency matters more."
        );

        return new RecommendationResponse(topPicks, portfolios, personalInsights, avoidReasons);
    }

    public OverlapResponse analyzeOverlap(List<Long> fundIds) {
        List<MutualFund> selectedFunds = fundRepository.findAllById(fundIds);
        Map<String, Integer> overlaps = new LinkedHashMap<>();
        selectedFunds.forEach(fund -> csvMapper.splitStrings(fund.getCompaniesCsv()).forEach(company -> overlaps.merge(company, 1, Integer::sum)));
        Map<String, Integer> overlappingCompanies = overlaps.entrySet().stream()
                .filter(entry -> entry.getValue() > 1)
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(6)
                .collect(LinkedHashMap::new, (map, entry) -> map.put(entry.getKey(), entry.getValue()), LinkedHashMap::putAll);

        List<String> insights = new ArrayList<>();
        if (overlappingCompanies.isEmpty()) {
            insights.add("These funds do not have meaningful visible company overlap in the current dataset.");
        } else {
            insights.add("These funds overlap in major holdings, so adding all of them may not improve diversification much.");
            insights.add("If you want a broader portfolio, replace one overlapping fund with a hybrid, debt, or index option.");
        }
        return new OverlapResponse(overlappingCompanies, insights);
    }

    public MonthlySummaryResponse getMonthlySummary(Long userId) {
        List<PortfolioHolding> holdings = holdingRepository.findByUserId(userId);
        if (holdings.isEmpty()) {
            return new MonthlySummaryResponse(
                    "No portfolio activity yet.",
                    "No best performer yet",
                    "No weakest performer yet",
                    "Start with one SIP and review after one month.",
                    List.of("Monthly summaries become richer after you add holdings or watchlist items.")
            );
        }
        PortfolioHolding best = holdings.stream().max(Comparator.comparingDouble(holding -> holding.getCurrentValue() - holding.getInvestedAmount())).orElseThrow();
        PortfolioHolding weakest = holdings.stream().min(Comparator.comparingDouble(holding -> holding.getCurrentValue() - holding.getInvestedAmount())).orElseThrow();
        List<String> highlights = new ArrayList<>();
        highlights.add(best.getFund().getName() + " added the strongest gain in the portfolio.");
        highlights.add(weakest.getFund().getName() + " needs a closer review before adding more money.");
        highlights.add("Re-check your sector concentration before your next SIP cycle.");
        return new MonthlySummaryResponse(
                "Your portfolio moved through the month with " + (holdings.size() > 2 ? "reasonable diversification." : "limited diversification."),
                best.getFund().getName(),
                weakest.getFund().getName(),
                "Add one non-overlapping fund or increase SIP in the most stable existing holding.",
                highlights
        );
    }

    private boolean matchesProfile(String profile, MutualFund fund) {
        return switch (profile) {
            case "Conservative" -> "Debt".equalsIgnoreCase(fund.getFundType()) || "Hybrid".equalsIgnoreCase(fund.getFundType()) || "Moderate".equalsIgnoreCase(fund.getRiskLevel());
            case "Moderate" -> !"High".equalsIgnoreCase(fund.getRiskLevel());
            default -> "Equity".equalsIgnoreCase(fund.getFundType()) || "ELSS".equalsIgnoreCase(fund.getFundType()) || fund.getRiskLevel().contains("High");
        };
    }

    private String profileSummary(String profile) {
        return switch (profile) {
            case "Conservative" -> "You value stability first. Debt and balanced funds should usually come before high-volatility equity funds.";
            case "Moderate" -> "You can handle some market movement, but balance matters. Blend growth funds with lower-volatility options.";
            default -> "You can take more volatility for long-term growth. Equity-heavy funds can suit you if your horizon is long enough.";
        };
    }

    private double recommendationScore(MutualFund fund) {
        return fund.getReturns3Y() * 2.2
                + fund.getReturns5Y() * 1.8
                + fund.getRating() * 9
                + fund.getSharpeRatio() * 12
                - fund.getExpenseRatio() * 18
                - Math.max(0, fund.getBeta() - 1.0) * 8;
    }

    private void rebalanceAllocations(Long userId) {
        List<PortfolioHolding> holdings = holdingRepository.findByUserId(userId);
        double total = holdings.stream().mapToDouble(PortfolioHolding::getCurrentValue).sum();
        if (total <= 0) {
            return;
        }
        holdings.forEach(holding -> holding.setAllocationPercent((holding.getCurrentValue() / total) * 100));
        holdingRepository.saveAll(holdings);
    }

    private AppUser getUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
