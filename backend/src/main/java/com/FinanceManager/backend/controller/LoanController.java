package com.FinanceManager.backend.controller;

import com.FinanceManager.backend.entity.Loan;
import com.FinanceManager.backend.service.LoanService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/loans")
@AllArgsConstructor
public class LoanController {

    private LoanService loanService;

    @GetMapping("/user/{userId}")
    public List<Loan> getUserLoans(@PathVariable UUID userId) {
        return loanService.getUserLoans(userId);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Loan> createLoan(@PathVariable UUID userId,
                                           @RequestBody Loan loan) {
        Loan saved = loanService.createLoan(userId, loan);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Loan> updateLoan(@PathVariable UUID id, @RequestBody Loan loanDetails) {
        Loan updatedLoan = loanService.updateLoan(id, loanDetails);
        return ResponseEntity.ok(updatedLoan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        loanService.deleteLoan(id);
        return ResponseEntity.noContent().build();
    }
}