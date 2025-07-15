package com.FinanceManager.backend.controller;

import com.FinanceManager.backend.service.AnalyticsService;
import com.FinanceManager.backend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;
    private final ExpenseService expenseService;

    @GetMapping("/insights")
    public ResponseEntity<String> getInsights(@RequestParam UUID userId) {
        try {
            String insights = analyticsService.getExpenseInsights(userId);
            return ResponseEntity.ok(insights);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Analysis failed");
        }
    }

    @GetMapping("/monthly")
    public ResponseEntity<BigDecimal> getCurrentMonthExpenses(@RequestParam UUID userId) { return ResponseEntity.ok(expenseService.getCurrentMonthExpenses(userId)); }

    @GetMapping("/weekly")
    public ResponseEntity<BigDecimal> getCurrentWeekExpenses(@RequestParam UUID userId) { return ResponseEntity.ok(expenseService.getCurrentWeekExpenses(userId)); }

    @GetMapping("/yearly")
    public ResponseEntity<BigDecimal> getCurrentYearExpenses(@RequestParam UUID userId) { return ResponseEntity.ok(expenseService.getCurrentYearExpenses(userId)); }

    @GetMapping("/monthly-breakdown")
    public ResponseEntity<Map<String, BigDecimal>> getMonthlyBreakdown(@RequestParam UUID userId) {
        return ResponseEntity.ok(expenseService.getMonthlyBreakdown(userId));
    }

    @GetMapping("/weekly-breakdown")
    public ResponseEntity<Map<String, BigDecimal>> getWeeklyBreakdown(@RequestParam UUID userId) {
        return ResponseEntity.ok(expenseService.getWeeklyBreakdown(userId));
    }
}
