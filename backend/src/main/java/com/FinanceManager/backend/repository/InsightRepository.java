package com.FinanceManager.backend.repository;

import com.FinanceManager.backend.entity.Insight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InsightRepository extends JpaRepository<Insight, UUID> {
    List<Insight> findByUserId(UUID userId);
}
