package com.mutualfunds.backend.controller;

import com.mutualfunds.backend.dto.FundDtos.FundResponse;
import com.mutualfunds.backend.dto.FundDtos.FundUpsertRequest;
import com.mutualfunds.backend.dto.FundDtos.LiveSyncResponse;
import com.mutualfunds.backend.dto.FundDtos.ModelPortfolioResponse;
import com.mutualfunds.backend.dto.FundDtos.NavHistoryPoint;
import com.mutualfunds.backend.service.FundService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/funds")
@RequiredArgsConstructor
public class FundController {

    private final FundService fundService;

    @GetMapping
    public List<FundResponse> getFunds(@RequestParam(required = false) String query) {
        return fundService.getAllFunds(query);
    }

    @GetMapping("/{id}")
    public FundResponse getFund(@PathVariable Long id) {
        return fundService.getFund(id);
    }

    @GetMapping("/{id}/history")
    public List<NavHistoryPoint> getFundHistory(@PathVariable Long id) {
        return fundService.getNavHistory(id);
    }

    @GetMapping("/model-portfolios")
    public List<ModelPortfolioResponse> getModelPortfolios() {
        return fundService.getModelPortfolios();
    }

    @PostMapping
    public FundResponse createFund(@Valid @RequestBody FundUpsertRequest request) {
        return fundService.createFund(request);
    }

    @PutMapping("/{id}")
    public FundResponse updateFund(@PathVariable Long id, @Valid @RequestBody FundUpsertRequest request) {
        return fundService.updateFund(id, request);
    }

    @PostMapping("/live-sync")
    public LiveSyncResponse syncLiveData() {
        return fundService.syncLiveData();
    }
}
