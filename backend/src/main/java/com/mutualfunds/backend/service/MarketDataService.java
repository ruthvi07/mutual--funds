package com.mutualfunds.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mutualfunds.backend.dto.MarketDtos.MarketTickerItem;
import com.mutualfunds.backend.dto.MarketDtos.MarketTickerResponse;
import java.io.IOException;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MarketDataService {

    private static final String NSE_HOME = "https://www.nseindia.com/";
    private static final String NSE_INDICES_API = "https://www.nseindia.com/api/allIndices";
    private static final Set<String> TRACKED_INDICES = Set.of(
            "NIFTY 50",
            "NIFTY BANK",
            "NIFTY IT",
            "NIFTY AUTO",
            "NIFTY FMCG",
            "NIFTY PHARMA",
            "NIFTY ENERGY",
            "NIFTY MIDCAP 100"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    public MarketTickerResponse getTicker() {
        try {
            List<MarketTickerItem> items = parseTicker(fetchWithJava());
            if (!items.isEmpty()) {
                return new MarketTickerResponse(items, Instant.now().toString(), "Live NSE website data");
            }
        } catch (Exception ignored) {
        }

        try {
            List<MarketTickerItem> items = parseTicker(fetchWithCurl());
            if (!items.isEmpty()) {
                return new MarketTickerResponse(items, Instant.now().toString(), "Live NSE website data via curl fallback");
            }
        } catch (Exception ignored) {
        }

        return new MarketTickerResponse(defaultTicker(), Instant.now().toString(), "Live NSE ticker unavailable, showing fallback snapshot");
    }

    private String fetchWithJava() throws IOException, InterruptedException {
        CookieManager cookieManager = new CookieManager();
        cookieManager.setCookiePolicy(CookiePolicy.ACCEPT_ALL);
        HttpClient client = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .cookieHandler(cookieManager)
                .build();

        HttpRequest homeRequest = HttpRequest.newBuilder(URI.create(NSE_HOME))
                .header("user-agent", "Mozilla/5.0")
                .header("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .GET()
                .build();
        client.send(homeRequest, HttpResponse.BodyHandlers.ofString());

        HttpRequest apiRequest = HttpRequest.newBuilder(URI.create(NSE_INDICES_API))
                .header("user-agent", "Mozilla/5.0")
                .header("accept", "application/json,text/plain,*/*")
                .header("referer", NSE_HOME)
                .header("authority", "www.nseindia.com")
                .GET()
                .build();

        return client.send(apiRequest, HttpResponse.BodyHandlers.ofString()).body();
    }

    private String fetchWithCurl() throws IOException, InterruptedException {
        Process process = new ProcessBuilder(
                "curl",
                "-L",
                "-s",
                "-H",
                "user-agent: Mozilla/5.0",
                "-H",
                "accept: application/json,text/plain,*/*",
                "-H",
                "referer: https://www.nseindia.com/",
                NSE_INDICES_API
        ).start();
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new IOException("curl failed with exit code " + exitCode);
        }
        return new String(process.getInputStream().readAllBytes());
    }

    private List<MarketTickerItem> parseTicker(String body) throws IOException {
        JsonNode root = objectMapper.readTree(body);
        JsonNode data = root.path("data");
        if (!data.isArray()) {
            return List.of();
        }

        List<MarketTickerItem> items = new ArrayList<>();
        for (JsonNode node : data) {
            String index = node.path("index").asText("");
            if (!TRACKED_INDICES.contains(index)) {
                continue;
            }
            items.add(new MarketTickerItem(
                    index,
                    index,
                    parseDouble(node.path("last").asText()),
                    parseDouble(node.path("variation").asText()),
                    parseDouble(node.path("percentChange").asText()),
                    "NSE",
                    "NSE Website"
            ));
        }

        return items.stream()
                .sorted(Comparator.comparing(MarketTickerItem::displayName))
                .toList();
    }

    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value.replace(",", "").trim());
        } catch (Exception ex) {
            return 0.0;
        }
    }

    private List<MarketTickerItem> defaultTicker() {
        return List.of(
                item("NIFTY 50", 22490.25, 118.40, 0.53),
                item("NIFTY BANK", 48760.10, 176.15, 0.36),
                item("NIFTY IT", 36540.85, -94.30, -0.26),
                item("NIFTY AUTO", 21330.45, 88.20, 0.42),
                item("NIFTY PHARMA", 18980.70, 51.60, 0.27)
        );
    }

    private MarketTickerItem item(String name, double last, double change, double percentChange) {
        return new MarketTickerItem(name, name, last, change, percentChange, "NSE", "Fallback");
    }
}
