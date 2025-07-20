package com.FinanceManager.backend.service;

import com.FinanceManager.backend.entity.Loan;
import com.FinanceManager.backend.repository.LoanRepository;
import jakarta.persistence.EntityNotFoundException; // Import this
import lombok.AllArgsConstructor;
import com.FinanceManager.backend.entity.User;
import org.springframework.stereotype.Service;
import com.FinanceManager.backend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional; // Import this

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class LoanService {
    private LoanRepository loanRepository;
    private UserRepository userRepository;

    public Loan createLoan(UUID userId, Loan loan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        loan.setUser(user);
        return loanRepository.save(loan);
    }

    public List<Loan> getUserLoans(UUID userId) {
        return loanRepository.findByUserId(userId);
    }

    @Transactional
    public Loan updateLoan(UUID loanId, Loan loanDetails) {
        Loan existingLoan = loanRepository.findById(loanId)
                .orElseThrow(() -> new EntityNotFoundException("Loan not found with id: " + loanId));

        existingLoan.setAmount(loanDetails.getAmount());
        existingLoan.setDescription(loanDetails.getDescription());
        existingLoan.setLoanDate(loanDetails.getLoanDate());
        existingLoan.setBorrower(loanDetails.getBorrower());

        return loanRepository.save(existingLoan);
    }

    public void deleteLoan(UUID loanId) {
        if (!loanRepository.existsById(loanId)) {
            throw new EntityNotFoundException("Loan not found with id: " + loanId);
        }
        loanRepository.deleteById(loanId);
    }
}