package com.FinanceManager.backend.controller;

import lombok.AllArgsConstructor;
import com.FinanceManager.backend.entity.Expense;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.FinanceManager.backend.service.ExpenseService;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@AllArgsConstructor
public class ExpenseController {

    private ExpenseService expenseService;

    @GetMapping("/user/{userId}")
    public List<Expense> getUserExpenses(@PathVariable UUID userId) {
        return expenseService.getUserExpenses(userId);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Expense> createExpense(@PathVariable UUID userId,
                                                 @RequestBody Expense expense) {
        Expense saved = expenseService.createExpense(userId, expense);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable UUID id, @RequestBody Expense expenseDetails) {
        Expense updatedExpense = expenseService.updateExpense(id, expenseDetails);
        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}