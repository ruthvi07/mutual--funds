package com.mutualfunds.backend.repository;

import com.mutualfunds.backend.domain.MutualFund;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MutualFundRepository extends JpaRepository<MutualFund, Long> {
    List<MutualFund> findByNameContainingIgnoreCase(String query);
    List<MutualFund> findByRiskLevel(String riskLevel);
    List<MutualFund> findByFundType(String fundType);
    Optional<MutualFund> findBySchemeCode(String schemeCode);
}
