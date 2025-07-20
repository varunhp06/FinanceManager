package com.FinanceManager.backend;

import com.FinanceManager.backend.entity.Debt;
import com.FinanceManager.backend.entity.User;
import com.FinanceManager.backend.repository.DebtRepository;
import com.FinanceManager.backend.repository.UserRepository;
import com.FinanceManager.backend.service.DebtService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DebtServiceTest {

    @Mock
    private DebtRepository debtRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DebtService debtService;

    private User testUser;
    private Debt testDebt;
    private UUID userId;
    private UUID debtId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        debtId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setUsername("testuser");

        testDebt = new Debt();
        testDebt.setId(debtId);
        testDebt.setUser(testUser);
        testDebt.setAmount(new BigDecimal("1000.00"));
        testDebt.setDescription("Personal Loan");
        testDebt.setLender("City Bank");
        testDebt.setDebtDate(LocalDate.now());
    }

    @Test
    @DisplayName("createDebt should save and return debt when user exists")
    void createDebt_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(debtRepository.save(any(Debt.class))).thenReturn(testDebt);

        Debt newDebt = new Debt();
        newDebt.setAmount(new BigDecimal("1000.00"));

        Debt createdDebt = debtService.createDebt(userId, newDebt);

        assertNotNull(createdDebt);
        assertEquals(testUser, createdDebt.getUser());
        assertEquals(new BigDecimal("1000.00"), createdDebt.getAmount());
        verify(userRepository, times(1)).findById(userId);
        verify(debtRepository, times(1)).save(newDebt);
    }

    @Test
    @DisplayName("createDebt should throw EntityNotFoundException when user does not exist")
    void createDebt_UserNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            debtService.createDebt(userId, new Debt());
        });
        verify(debtRepository, never()).save(any(Debt.class));
    }

    @Test
    @DisplayName("getUserDebts should return a list of debts for a user")
    void getUserDebts_Success() {
        when(debtRepository.findByUserId(userId)).thenReturn(Collections.singletonList(testDebt));

        List<Debt> debts = debtService.getUserDebts(userId);

        assertNotNull(debts);
        assertEquals(1, debts.size());
        assertEquals(testDebt, debts.get(0));
        verify(debtRepository, times(1)).findByUserId(userId);
    }

    @Test
    @DisplayName("updateDebt should update fields and return the updated debt")
    void updateDebt_Success() {
        Debt debtDetails = new Debt();
        debtDetails.setAmount(new BigDecimal("1200.50"));
        debtDetails.setDescription("Updated Loan");
        debtDetails.setLender("New Lender");
        debtDetails.setDebtDate(LocalDate.now().minusDays(5));

        when(debtRepository.findById(debtId)).thenReturn(Optional.of(testDebt));
        when(debtRepository.save(any(Debt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Debt updatedDebt = debtService.updateDebt(debtId, debtDetails);

        assertNotNull(updatedDebt);
        assertEquals(new BigDecimal("1200.50"), updatedDebt.getAmount());
        assertEquals("Updated Loan", updatedDebt.getDescription());
        assertEquals("New Lender", updatedDebt.getLender());
        verify(debtRepository, times(1)).findById(debtId);
        verify(debtRepository, times(1)).save(testDebt);
    }

    @Test
    @DisplayName("updateDebt should throw EntityNotFoundException when debt does not exist")
    void updateDebt_NotFound() {
        when(debtRepository.findById(debtId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            debtService.updateDebt(debtId, new Debt());
        });
    }

    @Test
    @DisplayName("deleteDebt should call deleteById when debt exists")
    void deleteDebt_Success() {
        when(debtRepository.existsById(debtId)).thenReturn(true);
        doNothing().when(debtRepository).deleteById(debtId);

        debtService.deleteDebt(debtId);

        verify(debtRepository, times(1)).existsById(debtId);
        verify(debtRepository, times(1)).deleteById(debtId);
    }

    @Test
    @DisplayName("deleteDebt should throw EntityNotFoundException when debt does not exist")
    void deleteDebt_NotFound() {
        when(debtRepository.existsById(debtId)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> {
            debtService.deleteDebt(debtId);
        });
        verify(debtRepository, never()).deleteById(any(UUID.class));
    }
}