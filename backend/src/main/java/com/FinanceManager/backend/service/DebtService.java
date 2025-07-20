package com.FinanceManager.backend.service;

import com.FinanceManager.backend.entity.Debt;
import com.FinanceManager.backend.entity.User;
import com.FinanceManager.backend.repository.DebtRepository;
import com.FinanceManager.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException; // Import this
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import this

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class DebtService {
    private DebtRepository debtRepository;
    private UserRepository userRepository;

    public Debt createDebt(UUID userId, Debt debt) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        debt.setUser(user);
        return debtRepository.save(debt);
    }

    public List<Debt> getUserDebts(UUID userId) {
        return debtRepository.findByUserId(userId);
    }

    @Transactional
    public Debt updateDebt(UUID debtId, Debt debtDetails) {
        Debt existingDebt = debtRepository.findById(debtId)
                .orElseThrow(() -> new EntityNotFoundException("Debt not found with id: " + debtId));

        existingDebt.setAmount(debtDetails.getAmount());
        existingDebt.setDescription(debtDetails.getDescription());
        existingDebt.setDebtDate(debtDetails.getDebtDate());
        existingDebt.setLender(debtDetails.getLender());

        return debtRepository.save(existingDebt);
    }

    public void deleteDebt(UUID debtId) {
        if (!debtRepository.existsById(debtId)) {
            throw new EntityNotFoundException("Debt not found with id: " + debtId);
        }
        debtRepository.deleteById(debtId);
    }
}