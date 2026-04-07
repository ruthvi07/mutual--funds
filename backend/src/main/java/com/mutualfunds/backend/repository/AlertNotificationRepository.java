package com.mutualfunds.backend.repository;

import com.mutualfunds.backend.domain.AlertNotification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertNotificationRepository extends JpaRepository<AlertNotification, Long> {
    List<AlertNotification> findByUserId(Long userId);
}
