package com.mutualfunds.backend.repository;

import com.mutualfunds.backend.domain.GoalPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalPlanRepository extends JpaRepository<GoalPlan, Long> {
    List<GoalPlan> findByUserId(Long userId);
}
