package com.FinanceManager.backend.service;

import com.FinanceManager.backend.entity.Loan;
import com.FinanceManager.backend.repository.LoanRepository;
import lombok.AllArgsConstructor;
import com.FinanceManager.backend.entity.User;
import org.springframework.stereotype.Service;
import com.FinanceManager.backend.repository.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class LoanService {
    private LoanRepository loanRepository;
    private UserRepository userRepository;

    public Loan createLoan(UUID userId, Loan loan) {
        User user = userRepository.findById(userId).orElseThrow();
        loan.setUser(user);
        return loanRepository.save(loan);
    }

    public List<Loan> getUserLoans(UUID userId) {
        return loanRepository.findByUserId(userId);
    }

    public void deleteLoan(UUID loanId) {
        loanRepository.deleteById(loanId);
    }
}

