package com.FinanceManager.backend.controller;

import com.FinanceManager.backend.entity.Debt;
import com.FinanceManager.backend.service.DebtService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/debts")
@AllArgsConstructor
public class DebtController {

    private DebtService debtService;

    @GetMapping("/user/{userId}")
    public List<Debt> getUserDebts(@PathVariable UUID userId) {
        return debtService.getUserDebts(userId);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Debt> createDebt(@PathVariable UUID userId,
                                                 @RequestBody Debt debt) {
        Debt saved = debtService.createDebt(userId, debt);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        debtService.deleteDebt(id);
        return ResponseEntity.noContent().build();
    }
}

