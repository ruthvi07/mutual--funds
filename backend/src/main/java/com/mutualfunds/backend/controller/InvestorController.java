package com.mutualfunds.backend.controller;

import com.mutualfunds.backend.domain.GoalPlan;
import com.mutualfunds.backend.domain.SipPlan;
import com.mutualfunds.backend.dto.InvestorDtos.GoalPlanRequest;
import com.mutualfunds.backend.dto.InvestorDtos.InvestRequest;
import com.mutualfunds.backend.dto.InvestorDtos.InvestResponse;
import com.mutualfunds.backend.dto.InvestorDtos.MonthlySummaryResponse;
import com.mutualfunds.backend.dto.InvestorDtos.OverlapResponse;
import com.mutualfunds.backend.dto.InvestorDtos.PortfolioSummaryResponse;
import com.mutualfunds.backend.dto.InvestorDtos.RecommendationResponse;
import com.mutualfunds.backend.dto.InvestorDtos.RiskProfileRequest;
import com.mutualfunds.backend.dto.InvestorDtos.RiskProfileResponse;
import com.mutualfunds.backend.dto.InvestorDtos.SipPlanRequest;
import com.mutualfunds.backend.dto.InvestorDtos.WatchlistItemResponse;
import com.mutualfunds.backend.dto.InvestorDtos.WatchlistRequest;
import com.mutualfunds.backend.service.InvestorService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/investor")
@RequiredArgsConstructor
public class InvestorController {

    private final InvestorService investorService;

    @PostMapping("/risk-profile")
    public RiskProfileResponse getRiskProfile(@Valid @RequestBody RiskProfileRequest request) {
        return investorService.calculateRiskProfile(request);
    }

    @GetMapping("/{userId}/portfolio")
    public PortfolioSummaryResponse getPortfolio(@PathVariable Long userId) {
        return investorService.getPortfolioSummary(userId);
    }

    @GetMapping("/{userId}/watchlist")
    public List<WatchlistItemResponse> getWatchlist(@PathVariable Long userId) {
        return investorService.getWatchlist(userId);
    }

    @PostMapping("/watchlist")
    public WatchlistItemResponse addToWatchlist(@Valid @RequestBody WatchlistRequest request) {
        return investorService.addToWatchlist(request.userId(), request.fundId());
    }

    @DeleteMapping("/{userId}/watchlist/{fundId}")
    public void removeFromWatchlist(@PathVariable Long userId, @PathVariable Long fundId) {
        investorService.removeFromWatchlist(userId, fundId);
    }

    @GetMapping("/{userId}/recommendations")
    public RecommendationResponse getRecommendations(@PathVariable Long userId) {
        return investorService.getRecommendations(userId);
    }

    @GetMapping("/overlap")
    public OverlapResponse analyzeOverlap(@RequestParam List<Long> fundIds) {
        return investorService.analyzeOverlap(fundIds);
    }

    @GetMapping("/{userId}/monthly-summary")
    public MonthlySummaryResponse getMonthlySummary(@PathVariable Long userId) {
        return investorService.getMonthlySummary(userId);
    }

    @PostMapping("/goals")
    public GoalPlan createGoal(@Valid @RequestBody GoalPlanRequest request) {
        return investorService.createGoalPlan(request);
    }

    @PostMapping("/invest")
    public InvestResponse invest(@Valid @RequestBody InvestRequest request) {
        return investorService.invest(request);
    }

    @PostMapping("/sips")
    public SipPlan createSip(@Valid @RequestBody SipPlanRequest request) {
        return investorService.createSipPlan(request);
    }
}
