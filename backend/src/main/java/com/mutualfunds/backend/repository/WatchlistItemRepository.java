package com.mutualfunds.backend.repository;

import com.mutualfunds.backend.domain.WatchlistItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, Long> {
    @EntityGraph(attributePaths = "fund")
    List<WatchlistItem> findByUserId(Long userId);
    @EntityGraph(attributePaths = "fund")
    Optional<WatchlistItem> findByUserIdAndFundId(Long userId, Long fundId);
}
