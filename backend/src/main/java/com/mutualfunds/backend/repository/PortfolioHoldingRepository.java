package com.mutualfunds.backend.repository;

import com.mutualfunds.backend.domain.PortfolioHolding;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHolding, Long> {
    @EntityGraph(attributePaths = "fund")
    List<PortfolioHolding> findByUserId(Long userId);

    @EntityGraph(attributePaths = "fund")
    Optional<PortfolioHolding> findByUserIdAndFundId(Long userId, Long fundId);
}
