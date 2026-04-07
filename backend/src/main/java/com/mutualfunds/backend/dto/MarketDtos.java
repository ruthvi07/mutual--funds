package com.mutualfunds.backend.dto;

import java.util.List;

public class MarketDtos {

    public record MarketTickerItem(
            String symbol,
            String displayName,
            Double lastPrice,
            Double change,
            Double percentChange,
            String exchange,
            String source
    ) {}

    public record MarketTickerResponse(
            List<MarketTickerItem> items,
            String fetchedAt,
            String note
    ) {}
}
