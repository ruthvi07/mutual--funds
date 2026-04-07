package com.mutualfunds.backend.service;

import com.mutualfunds.backend.domain.AppUser;
import com.mutualfunds.backend.domain.Complaint;
import com.mutualfunds.backend.domain.UserRole;
import com.mutualfunds.backend.dto.AdminDtos.ComplianceAlert;
import com.mutualfunds.backend.dto.AdminDtos.ComplaintResponse;
import com.mutualfunds.backend.dto.AdminDtos.DashboardResponse;
import com.mutualfunds.backend.repository.AppUserRepository;
import com.mutualfunds.backend.repository.ComplaintRepository;
import com.mutualfunds.backend.repository.MutualFundRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AppUserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final MutualFundRepository fundRepository;

    public DashboardResponse getDashboard() {
        var advisors = userRepository.findByRole(UserRole.FINANCIAL_ADVISOR);
        var openComplaints = complaintRepository.findByStatus("OPEN");
        var funds = fundRepository.findAll();
        int liveFundsCovered = (int) funds.stream().filter(fund -> fund.getLatestNav() != null).count();
        int misSellingFlags = (int) funds.stream().filter(fund -> fund.getExpenseRatio() > 1.0 || fund.getRiskLevel().contains("High")).count();
        double unclaimedAmountCr = Math.max(2.4, openComplaints.size() * 0.85);
        List<ComplianceAlert> complianceAlerts = List.of(
                new ComplianceAlert(
                        "Explainability check",
                        "High-risk funds should always be shown with clear 'why suitable / why not suitable' guidance.",
                        "High"
                ),
                new ComplianceAlert(
                        "Overlap risk",
                        "Investors may be buying multiple similar equity funds without seeing portfolio overlap.",
                        "Medium"
                ),
                new ComplianceAlert(
                        "Unclaimed money follow-up",
                        "Dormant investors need alerts and outreach before money becomes unclaimed.",
                        "Medium"
                )
        );
        return new DashboardResponse(
                (int) advisors.stream().filter(user -> "PENDING".equals(user.getStatus())).count(),
                openComplaints.size(),
                3,
                funds.size(),
                misSellingFlags,
                unclaimedAmountCr,
                liveFundsCovered,
                complianceAlerts,
                advisors.stream().map(AuthService::toUserResponse).toList(),
                openComplaints.stream().map(this::toComplaintResponse).toList()
        );
    }

    public void updateComplaintStatus(Long complaintId, String status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found"));
        complaint.setStatus(status);
        complaintRepository.save(complaint);
    }

    public void updateUserStatus(Long userId, String status) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
    }

    private ComplaintResponse toComplaintResponse(Complaint complaint) {
        return new ComplaintResponse(
                complaint.getId(),
                complaint.getUser().getId(),
                complaint.getUser().getFullName(),
                complaint.getMessage(),
                complaint.getStatus()
        );
    }
}
