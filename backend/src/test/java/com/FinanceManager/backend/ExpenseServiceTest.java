package com.FinanceManager.backend;

import com.FinanceManager.backend.entity.Expense;
import com.FinanceManager.backend.entity.User;
import com.FinanceManager.backend.repository.ExpenseRepository;
import com.FinanceManager.backend.repository.UserRepository;
import com.FinanceManager.backend.service.ExpenseService;
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
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private User testUser;
    private Expense testExpense;
    private UUID userId;
    private UUID expenseId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        expenseId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setUsername("testuser");

        testExpense = new Expense();
        testExpense.setId(expenseId);
        testExpense.setUser(testUser);
        testExpense.setAmount(new BigDecimal("99.99"));
        testExpense.setDescription("Lunch meeting");
        testExpense.setCategory("Food");
        testExpense.setPayMethod("Credit Card");
        testExpense.setExpenseDate(LocalDate.now());
    }

    @Test
    @DisplayName("createExpense should save and return expense when user exists")
    void createExpense_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(expenseRepository.save(any(Expense.class))).thenReturn(testExpense);

        Expense newExpense = new Expense();
        newExpense.setAmount(new BigDecimal("99.99"));
        Expense createdExpense = expenseService.createExpense(userId, newExpense);

        assertNotNull(createdExpense);
        assertEquals(testUser, createdExpense.getUser());
        assertEquals(new BigDecimal("99.99"), createdExpense.getAmount());
        verify(userRepository, times(1)).findById(userId);
        verify(expenseRepository, times(1)).save(newExpense);
    }

    @Test
    @DisplayName("createExpense should throw EntityNotFoundException when user does not exist")
    void createExpense_UserNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            expenseService.createExpense(userId, new Expense());
        });
        verify(expenseRepository, never()).save(any(Expense.class));
    }

    @Test
    @DisplayName("updateExpense should update fields and return the updated expense")
    void updateExpense_Success() {
        Expense expenseDetails = new Expense();
        expenseDetails.setAmount(new BigDecimal("150.00"));
        expenseDetails.setDescription("Updated description");
        expenseDetails.setExpenseDate(LocalDate.now().minusDays(1));
        expenseDetails.setCategory("Travel");
        expenseDetails.setPayMethod("Cash");

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Expense updatedExpense = expenseService.updateExpense(expenseId, expenseDetails);

        assertNotNull(updatedExpense);
        assertEquals(new BigDecimal("150.00"), updatedExpense.getAmount());
        assertEquals("Updated description", updatedExpense.getDescription());
        assertEquals("Travel", updatedExpense.getCategory());
        verify(expenseRepository, times(1)).findById(expenseId);
        verify(expenseRepository, times(1)).save(testExpense);
    }

    @Test
    @DisplayName("updateExpense should throw EntityNotFoundException when expense does not exist")
    void updateExpense_NotFound() {
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            expenseService.updateExpense(expenseId, new Expense());
        });
    }

    @Test
    @DisplayName("getUserExpenses should return a list of expenses for a user")
    void getUserExpenses_Success() {
        when(expenseRepository.findByUserId(userId)).thenReturn(Arrays.asList(testExpense));

        List<Expense> expenses = expenseService.getUserExpenses(userId);

        assertNotNull(expenses);
        assertEquals(1, expenses.size());
        assertEquals(testExpense, expenses.get(0));
        verify(expenseRepository, times(1)).findByUserId(userId);
    }

    @Test
    @DisplayName("deleteExpense should call deleteById when expense exists")
    void deleteExpense_Success() {
        when(expenseRepository.existsById(expenseId)).thenReturn(true);
        doNothing().when(expenseRepository).deleteById(expenseId);

        expenseService.deleteExpense(expenseId);

        verify(expenseRepository, times(1)).existsById(expenseId);
        verify(expenseRepository, times(1)).deleteById(expenseId);
    }

    @Test
    @DisplayName("deleteExpense should throw EntityNotFoundException when expense does not exist")
    void deleteExpense_NotFound() {
        when(expenseRepository.existsById(expenseId)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> {
            expenseService.deleteExpense(expenseId);
        });
        verify(expenseRepository, never()).deleteById(any(UUID.class));
    }

    @Test
    @DisplayName("getWeeklyBreakdown should group expenses by week correctly")
    void getWeeklyBreakdown_Success() {
        Expense expense1 = new Expense();
        expense1.setExpenseDate(LocalDate.of(2025, 7, 14));
        expense1.setAmount(new BigDecimal("10"));

        Expense expense2 = new Expense(); // Wednesday
        expense2.setExpenseDate(LocalDate.of(2025, 7, 16));
        expense2.setAmount(new BigDecimal("20"));

        Expense expense3 = new Expense(); // Next Monday
        expense3.setExpenseDate(LocalDate.of(2025, 7, 21));
        expense3.setAmount(new BigDecimal("50"));

        when(expenseRepository.findByUserId(userId)).thenReturn(Arrays.asList(expense1, expense2, expense3));

        Map<String, BigDecimal> weeklyBreakdown = expenseService.getWeeklyBreakdown(userId);

        assertEquals(2, weeklyBreakdown.size());
        assertTrue(weeklyBreakdown.containsKey("Jul 14 – Jul 20"));
        assertTrue(weeklyBreakdown.containsKey("Jul 21 – Jul 27"));
        assertEquals(0, new BigDecimal("30").compareTo(weeklyBreakdown.get("Jul 14 – Jul 20")));
        assertEquals(0, new BigDecimal("50").compareTo(weeklyBreakdown.get("Jul 21 – Jul 27")));
    }
}