package com.mutualfunds.backend.repository;

import com.mutualfunds.backend.domain.EducationPost;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EducationPostRepository extends JpaRepository<EducationPost, Long> {
    @EntityGraph(attributePaths = "advisor")
    List<EducationPost> findByAdvisorId(Long advisorId);

    @Override
    @EntityGraph(attributePaths = "advisor")
    List<EducationPost> findAll();
}
