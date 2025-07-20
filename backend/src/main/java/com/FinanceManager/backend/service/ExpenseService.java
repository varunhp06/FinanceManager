package com.FinanceManager.backend.service;

import lombok.AllArgsConstructor;
import com.FinanceManager.backend.entity.Expense;
import com.FinanceManager.backend.entity.User;
import org.springframework.stereotype.Service;
import com.FinanceManager.backend.repository.ExpenseRepository;
import com.FinanceManager.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException; // Import this
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ExpenseService {
    private ExpenseRepository expenseRepository;
    private UserRepository userRepository;

    public Expense createExpense(UUID userId, Expense expense) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    public Expense updateExpense(UUID expenseId, Expense expenseDetails) {
        Expense existingExpense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found with id: " + expenseId));

        existingExpense.setAmount(expenseDetails.getAmount());
        existingExpense.setDescription(expenseDetails.getDescription());
        existingExpense.setExpenseDate(expenseDetails.getExpenseDate());
        existingExpense.setCategory(expenseDetails.getCategory());
        existingExpense.setPayMethod(expenseDetails.getPayMethod());

        return expenseRepository.save(existingExpense);
    }

    public List<Expense> getUserExpenses(UUID userId) {
        return expenseRepository.findByUserId(userId);
    }

    public void deleteExpense(UUID expenseId) {
        if (!expenseRepository.existsById(expenseId)) {
            throw new EntityNotFoundException("Expense not found with id: " + expenseId);
        }
        expenseRepository.deleteById(expenseId);
    }

    public BigDecimal getCurrentMonthExpenses(UUID userId) {
        LocalDate now = LocalDate.now();
        return expenseRepository.sumByUserAndExpenseDateBetween(
                userId,
                now.withDayOfMonth(1),
                now
        );
    }

    public BigDecimal getCurrentWeekExpenses(UUID userId) {
        LocalDate now = LocalDate.now();
        LocalDate weekStart = now.with(DayOfWeek.MONDAY);
        return expenseRepository.sumByUserAndExpenseDateBetween(userId, weekStart, now);
    }

    public BigDecimal getCurrentYearExpenses(UUID userId) {
        LocalDate now = LocalDate.now();
        return expenseRepository.sumByUserAndExpenseDateBetween(
                userId,
                now.withDayOfYear(1),
                now
        );
    }

    public Map<String, BigDecimal> getMonthlyBreakdown(UUID userId) {
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getExpenseDate().getMonth().toString().substring(0, 3),
                        Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));
    }

    public Map<String, BigDecimal> getWeeklyBreakdown(UUID userId) {
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d");

        return expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> {
                            LocalDate date = e.getExpenseDate();
                            LocalDate weekStart = date.with(DayOfWeek.MONDAY);
                            LocalDate weekEnd = weekStart.plusDays(6);

                            return formatter.format(weekStart) + " – " + formatter.format(weekEnd);
                        },
                        TreeMap::new,
                        Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));
    }

}