package com.mutualfunds.backend.repository;

import com.mutualfunds.backend.domain.Complaint;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    @EntityGraph(attributePaths = "user")
    List<Complaint> findByStatus(String status);
}
