package com.mutualfunds.backend.repository;

import com.mutualfunds.backend.domain.SipPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SipPlanRepository extends JpaRepository<SipPlan, Long> {
    List<SipPlan> findByUserId(Long userId);
}
