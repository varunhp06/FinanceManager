package com.FinanceManager.backend.service;

import com.FinanceManager.backend.entity.Expense;
import com.FinanceManager.backend.entity.Insight;
import com.FinanceManager.backend.repository.ExpenseRepository;
import com.FinanceManager.backend.repository.InsightRepository;
import com.FinanceManager.backend.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final ExpenseRepository expenseRepo;
    private final InsightRepository insightRepo;
    private final UserRepository userRepo;

    public String getExpenseInsights(UUID userId) throws IOException {
        List<Expense> expenses = expenseRepo.findByUserId(userId);
        List<Map<String, Object>> data = expenses.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("user_id", e.getUser().getId().toString());
            map.put("amount", e.getAmount());
            map.put("description", e.getDescription());
            map.put("category", e.getCategory());
            map.put("pay_method", e.getPayMethod());
            map.put("expense_date", e.getExpenseDate().toString());
            return map;
        }).toList();

        ProcessBuilder pb = new ProcessBuilder("/home/varun/DevJunk/FinanceManager/backend/ml/.venv/bin/python3", "/home/varun/DevJunk/FinanceManager/backend/ml/analyze_user.py");
        Process process = pb.start();

        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
            new ObjectMapper().writeValue(writer, data);
        }

        String jsonOutput;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            jsonOutput = reader.lines().collect(Collectors.joining());
        }
        System.out.println(jsonOutput);
        try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            String errorOutput = errorReader.lines().collect(Collectors.joining("\n"));
            if (!errorOutput.isEmpty()) {
                System.err.println("Python script error:\n" + errorOutput);
            }
        }

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> insightData = mapper.readValue(jsonOutput, new TypeReference<>() {});

        Insight insight = new Insight();
        insight.setUser(userRepo.findById(userId).orElseThrow());
        insight.setLabel((String) insightData.get("label"));
        insight.setTrend((String) insightData.get("trend"));
        insight.setTopCategory((String) insightData.get("topCategory"));
        insight.setSuggestions(mapper.writeValueAsString(insightData.get("suggestions")));
        insight.setAnomalies(mapper.writeValueAsString(insightData.get("anomalies")));
        insightRepo.save(insight);

        return jsonOutput;
    }

    @Scheduled(cron = "0 0 1 1 * *")
    public void generateMonthlyInsights() {
        userRepo.findAll().forEach(user -> {
            try {
                getExpenseInsights(user.getId());
            } catch (Exception ignored) {}
        });
    }
}
