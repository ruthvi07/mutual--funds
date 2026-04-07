package com.mutualfunds.backend.repository;

import com.mutualfunds.backend.domain.AppUser;
import com.mutualfunds.backend.domain.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    List<AppUser> findByRole(UserRole role);
}
