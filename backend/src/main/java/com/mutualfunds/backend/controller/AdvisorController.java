package com.mutualfunds.backend.controller;

import com.mutualfunds.backend.dto.AdvisorDtos.AdvisorDashboardResponse;
import com.mutualfunds.backend.dto.AdvisorDtos.EducationPostRequest;
import com.mutualfunds.backend.dto.AdvisorDtos.EducationPostResponse;
import com.mutualfunds.backend.service.AdvisorService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/advisor")
@RequiredArgsConstructor
public class AdvisorController {

    private final AdvisorService advisorService;

    @GetMapping("/dashboard")
    public AdvisorDashboardResponse getDashboard() {
        return advisorService.getDashboard();
    }

    @GetMapping("/posts")
    public List<EducationPostResponse> getPosts() {
        return advisorService.getPosts();
    }

    @PostMapping("/posts")
    public EducationPostResponse createPost(@Valid @RequestBody EducationPostRequest request) {
        return advisorService.createPost(request);
    }
}
