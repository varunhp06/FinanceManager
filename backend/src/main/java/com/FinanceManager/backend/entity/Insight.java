package com.FinanceManager.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Insight {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    private String label;
    private String trend;
    private String topCategory;
    @Column(columnDefinition = "TEXT")
    private String suggestions;
    @Column(columnDefinition = "TEXT")
    private String anomalies;

    private LocalDateTime createdAt = LocalDateTime.now();
}
