package com.mutualfunds.backend.service;

import com.mutualfunds.backend.domain.MutualFund;
import com.mutualfunds.backend.domain.NavHistory;
import com.mutualfunds.backend.dto.FundDtos.LiveSyncResponse;
import com.mutualfunds.backend.repository.MutualFundRepository;
import com.mutualfunds.backend.repository.NavHistoryRepository;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiveNavSyncService {

    private static final DateTimeFormatter NAV_DATE_FORMAT = DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.ENGLISH);
    private static final Set<String> STOP_WORDS = Set.of(
            "fund", "plan", "direct", "regular", "growth", "option", "idcw", "reinvestment",
            "bonus", "dividend", "payout", "scheme", "daily", "weekly", "monthly"
    );

    private final MutualFundRepository fundRepository;
    private final NavHistoryRepository navHistoryRepository;

    @Value("${app.live-nav.url:https://www.amfiindia.com/spages/NAVAll.txt}")
    private String navUrl;

    @Value("${app.live-nav.enabled:true}")
    private boolean liveNavEnabled;

    @EventListener(ApplicationReadyEvent.class)
    public void syncOnStartup() {
        if (!liveNavEnabled) {
            return;
        }
        try {
            syncNow();
        } catch (Exception exception) {
            log.warn("Initial AMFI sync skipped: {}", exception.getMessage());
        }
    }

    @Scheduled(cron = "${app.live-nav.cron:0 30 18 * * MON-FRI}")
    public void scheduledSync() {
        if (!liveNavEnabled) {
            return;
        }
        try {
            syncNow();
        } catch (Exception exception) {
            log.warn("Scheduled AMFI sync failed: {}", exception.getMessage());
        }
    }

    public LiveSyncResponse syncNow() {
        String payload = downloadNavPayload();
        List<NavRecord> records = parseNavRecords(payload);

        List<MutualFund> funds = fundRepository.findAll();
        Map<String, NavRecord> recordByCode = new HashMap<>();
        for (NavRecord record : records) {
            recordByCode.put(record.schemeCode(), record);
        }

        int matched = 0;
        for (MutualFund fund : funds) {
            Optional<NavRecord> exact = Optional.ofNullable(fund.getSchemeCode())
                    .map(recordByCode::get);
            NavRecord match = exact.orElseGet(() -> findBestMatch(fund, records).orElse(null));
            if (match == null) {
                continue;
            }
            fund.setSchemeCode(match.schemeCode());
            fund.setLatestNav(match.nav());
            fund.setLatestNavDate(match.navDate());
            fund.setLastSyncedAt(LocalDateTime.now());
            fund.setDataSource("AMFI");
            saveNavHistory(fund, match);
            matched += 1;
        }

        if (!funds.isEmpty()) {
            fundRepository.saveAll(funds);
        }

        return new LiveSyncResponse(
                "AMFI",
                LocalDateTime.now(),
                records.size(),
                matched,
                matched > 0
                        ? "Live NAV synced from AMFI and matched to project funds."
                        : "AMFI data downloaded, but no matching project funds were found."
        );
    }

    private String downloadNavPayload() {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(navUrl))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();
        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new IllegalStateException("AMFI returned HTTP " + response.statusCode());
            }
            return response.body();
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            log.warn("Java HTTP download failed for AMFI: {}. Falling back to curl.", exception.getMessage());
            return downloadWithCurl();
        }
    }

    private String downloadWithCurl() {
        ProcessBuilder processBuilder = new ProcessBuilder("curl", "-L", "-s", navUrl);
        try {
            Process process = processBuilder.start();
            byte[] output;
            try (InputStream inputStream = process.getInputStream()) {
                output = inputStream.readAllBytes();
            }
            int exit = process.waitFor();
            if (exit != 0 || output.length == 0) {
                throw new IllegalStateException("curl failed to download AMFI NAV data");
            }
            return new String(output, StandardCharsets.UTF_8);
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new IllegalStateException("Unable to download AMFI NAV data", exception);
        }
    }

    private List<NavRecord> parseNavRecords(String payload) {
        List<NavRecord> records = new ArrayList<>();
        for (String rawLine : payload.split("\\R")) {
            String line = rawLine == null ? "" : rawLine.trim();
            if (line.isBlank() || !line.contains(";")) {
                continue;
            }
            String[] parts = line.split(";");
            if (parts.length < 6 || !parts[0].chars().allMatch(Character::isDigit)) {
                continue;
            }
            Double nav = parseDouble(parts[4]);
            LocalDate navDate = parseDate(parts[5]);
            if (nav == null || navDate == null) {
                continue;
            }
            records.add(new NavRecord(parts[0].trim(), parts[3].trim(), nav, navDate));
        }
        return records;
    }

    private Optional<NavRecord> findBestMatch(MutualFund fund, List<NavRecord> records) {
        String fundKey = normalizeName(fund.getName());
        return records.stream()
                .map(record -> Map.entry(record, similarityScore(fundKey, normalizeName(record.schemeName()))))
                .filter(entry -> entry.getValue() >= 0.55)
                .max(Comparator.comparingDouble(Map.Entry::getValue))
                .map(Map.Entry::getKey);
    }

    private String normalizeName(String value) {
        return value.toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private double similarityScore(String left, String right) {
        List<String> leftTokens = tokenize(left);
        List<String> rightTokens = tokenize(right);
        if (leftTokens.isEmpty() || rightTokens.isEmpty()) {
            return 0;
        }
        long common = leftTokens.stream().filter(rightTokens::contains).count();
        return (double) common / (double) Math.max(leftTokens.size(), rightTokens.size());
    }

    private List<String> tokenize(String value) {
        return List.of(value.split(" ")).stream()
                .filter(token -> !token.isBlank())
                .filter(token -> !STOP_WORDS.contains(token))
                .toList();
    }

    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value.trim(), NAV_DATE_FORMAT);
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private void saveNavHistory(MutualFund fund, NavRecord match) {
        if (fund.getId() == null || navHistoryRepository.existsByFundIdAndNavDate(fund.getId(), match.navDate())) {
            return;
        }
        NavHistory history = new NavHistory();
        history.setFund(fund);
        history.setNav(match.nav());
        history.setNavDate(match.navDate());
        navHistoryRepository.save(history);
    }

    private record NavRecord(
            String schemeCode,
            String schemeName,
            Double nav,
            LocalDate navDate
    ) {}
}
