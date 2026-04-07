package com.mutualfunds.backend.service;

import com.mutualfunds.backend.domain.AppUser;
import com.mutualfunds.backend.domain.EducationPost;
import com.mutualfunds.backend.domain.PortfolioHolding;
import com.mutualfunds.backend.dto.AdvisorDtos.AdvisorAction;
import com.mutualfunds.backend.dto.AdvisorDtos.AdvisorDashboardResponse;
import com.mutualfunds.backend.dto.AdvisorDtos.ClientSnapshot;
import com.mutualfunds.backend.dto.AdvisorDtos.EducationPostRequest;
import com.mutualfunds.backend.dto.AdvisorDtos.EducationPostResponse;
import com.mutualfunds.backend.repository.AppUserRepository;
import com.mutualfunds.backend.repository.EducationPostRepository;
import com.mutualfunds.backend.repository.PortfolioHoldingRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdvisorService {

    private final EducationPostRepository postRepository;
    private final AppUserRepository userRepository;
    private final PortfolioHoldingRepository holdingRepository;
    private final CsvMapper csvMapper;

    public AdvisorDashboardResponse getDashboard() {
        List<ClientSnapshot> clients = userRepository.findAll().stream()
                .filter(user -> user.getRole().name().equals("INVESTOR"))
                .limit(5)
                .map(this::toClientSnapshot)
                .toList();
        List<AdvisorAction> actions = List.of(
                new AdvisorAction(
                        "Suitability first",
                        "Recommend funds by risk profile and goal before discussing short-term returns."
                ),
                new AdvisorAction(
                        "Explain why not",
                        "If a fund is not suitable, explain the exact reason: high risk, overlap, or high cost."
                ),
                new AdvisorAction(
                        "Diversification review",
                        "Check whether the client's new selection actually improves sector and company spread."
                )
        );
        return new AdvisorDashboardResponse(
                clients.size(),
                64,
                29,
                actions,
                clients,
                postRepository.findAll().stream().map(this::toResponse).toList()
        );
    }

    public EducationPostResponse createPost(EducationPostRequest request) {
        AppUser advisor = userRepository.findById(request.advisorId())
                .orElseThrow(() -> new IllegalArgumentException("Advisor not found"));
        EducationPost post = new EducationPost();
        post.setAdvisor(advisor);
        post.setTitle(request.title());
        post.setPostType(request.postType());
        post.setSummary(request.summary());
        post.setLikesCount(0);
        post.setCommentsCsv("");
        return toResponse(postRepository.save(post));
    }

    public java.util.List<EducationPostResponse> getPosts() {
        return postRepository.findAll().stream().map(this::toResponse).toList();
    }

    private EducationPostResponse toResponse(EducationPost post) {
        return new EducationPostResponse(
                post.getId(),
                post.getAdvisor().getId(),
                post.getTitle(),
                post.getPostType(),
                post.getSummary(),
                post.getLikesCount(),
                csvMapper.splitStrings(post.getCommentsCsv())
        );
    }

    private ClientSnapshot toClientSnapshot(AppUser user) {
        List<PortfolioHolding> holdings = holdingRepository.findByUserId(user.getId());
        double invested = holdings.stream().mapToDouble(PortfolioHolding::getInvestedAmount).sum();
        double current = holdings.stream().mapToDouble(PortfolioHolding::getCurrentValue).sum();
        String profileHint = holdings.stream().map(PortfolioHolding::getFund).anyMatch(fund -> "High".equalsIgnoreCase(fund.getRiskLevel()))
                ? "Aggressive leaning"
                : holdings.stream().map(PortfolioHolding::getFund).anyMatch(fund -> "Debt".equalsIgnoreCase(fund.getFundType()))
                ? "Conservative leaning"
                : "Moderate leaning";
        return new ClientSnapshot(user.getId(), user.getFullName(), invested, current, profileHint);
    }
}
