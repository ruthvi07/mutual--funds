package com.mutualfunds.backend.repository;

import com.mutualfunds.backend.domain.NavHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NavHistoryRepository extends JpaRepository<NavHistory, Long> {
    List<NavHistory> findTop30ByFundIdOrderByNavDateDesc(Long fundId);
    boolean existsByFundIdAndNavDate(Long fundId, java.time.LocalDate navDate);
}
