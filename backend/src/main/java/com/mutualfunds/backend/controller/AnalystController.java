package com.mutualfunds.backend.controller;

import com.mutualfunds.backend.dto.AnalystDtos.AnalystDashboardResponse;
import com.mutualfunds.backend.service.AnalystService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analyst")
@RequiredArgsConstructor
public class AnalystController {

    private final AnalystService analystService;

    @GetMapping("/dashboard")
    public AnalystDashboardResponse getDashboard() {
        return analystService.getDashboard();
    }
}
