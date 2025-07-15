package com.FinanceManager.backend.service;

import com.FinanceManager.backend.entity.Debt;
import com.FinanceManager.backend.repository.DebtRepository;
import lombok.AllArgsConstructor;
import com.FinanceManager.backend.entity.Expense;
import com.FinanceManager.backend.entity.User;
import org.springframework.stereotype.Service;
import com.FinanceManager.backend.repository.ExpenseRepository;
import com.FinanceManager.backend.repository.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class DebtService {
    private DebtRepository debtRepository;
    private UserRepository userRepository;

    public Debt createDebt(UUID userId, Debt debt) {
        User user = userRepository.findById(userId).orElseThrow();
        debt.setUser(user);
        return debtRepository.save(debt);
    }

    public List<Debt> getUserDebts(UUID userId) {
        return debtRepository.findByUserId(userId);
    }

    public void deleteDebt(UUID expenseId) {
        debtRepository.deleteById(expenseId);
    }
}

