package com.mutualfunds.backend.controller;

import com.mutualfunds.backend.dto.MarketDtos.MarketTickerResponse;
import com.mutualfunds.backend.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketDataService marketDataService;

    @GetMapping("/ticker")
    public MarketTickerResponse getTicker() {
        return marketDataService.getTicker();
    }
}
