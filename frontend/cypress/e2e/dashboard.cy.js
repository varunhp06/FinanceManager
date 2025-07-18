describe("Dashboard Page", () => {
  const userId = "test-user-123";
  const mockExpenses = [
    { id: 1, amount: "150.75", category: "Food", date: "2023-10-26" },
    { id: 2, amount: "45.50", category: "Transport", date: "2023-10-25" },
    { id: 3, amount: "200.00", category: "Shopping", date: "2023-10-24" },
    { id: 4, amount: "80.00", category: "Food", date: "2023-10-23" },
  ];

  context("When there are no expenses", () => {
    beforeEach(() => {
      cy.intercept("GET", `/api/expenses/user/${userId}`, {
        statusCode: 200,
        body: [],
      }).as("getEmptyExpenses");

      cy.login(userId);
      cy.visit("/dashboard");
      cy.wait("@getEmptyExpenses");
    });

    it("should display the welcome message and main sections", () => {
      cy.get('[data-test="dashboard-page"]').should("be.visible");
      cy.get('[data-test="dashboard-welcome-heading"]')
          .should("be.visible")
          .and("contain.text", "welcome");
    });

    it("should show the overview section with zero values", () => {
      cy.get('[data-test="dashboard-overview"]').should("be.visible");
      cy.get('[data-test="total-entries"]').should("contain.text", "0");
      cy.get('[data-test="total-amount"]').should("contain.text", "₹0.00");
    });

    it("should display the empty state message", () => {
      cy.get('[data-test="empty-state-message"]')
          .should("be.visible")
          .and("contain.text", "statistics will appear once you start recording expenses");
    });
  });

  context("When there are expenses", () => {
    beforeEach(() => {
      cy.intercept("GET", `/api/expenses/user/${userId}`, {
        statusCode: 200,
        body: mockExpenses,
      }).as("getExpenses");

      cy.login(userId);
      cy.visit("/dashboard");
      cy.wait("@getExpenses");
    });

    it("should calculate and display the total number of entries", () => {
      cy.get('[data-test="total-entries"]').should("contain.text", mockExpenses.length);
    });

    it("should calculate and display the total amount spent", () => {
      const total = mockExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      cy.get('[data-test="total-amount"]').should("contain.text", `₹${total.toFixed(2)}`);
    });

    it("should not display the empty state message", () => {
      cy.get('[data-test="empty-state-message"]').should("not.exist");
    });
  });

  context("Navigation from Dashboard", () => {
    beforeEach(() => {
      cy.intercept("GET", `/api/expenses/user/${userId}`, { body: [] });
      cy.login(userId);
      cy.visit("/dashboard");
    });

    it('should navigate to the debts page when "open debt" is clicked', () => {
      cy.get('[data-test="debt-button"]').click();
      cy.url().should("include", "/debts");
    });

    it('should navigate to the expenses page when "open expenses" is clicked', () => {
      cy.get('[data-test="expenses-button"]').click();
      cy.url().should("include", "/expenses");
    });

    it('should navigate to the loans page when "open loans" is clicked', () => {
      cy.get('[data-test="loans-button"]').click();
      cy.url().should("include", "/loans");
    });

    it("should navigate to the analytics page when the link is clicked", () => {
      cy.get('[data-test="analytics-link"]').click();
      cy.url().should("include", "/analytics");
    });
  });
});

describe("Expenses Page", () => {
  const userId = "test-user-123";
  const mockExpenses = [
    { id: 1, amount: "100", description: "Lunch", expenseDate: "2023-10-26", category: "food", payMethod: "cash" },
    { id: 2, amount: "2500", description: "Train ticket", expenseDate: "2023-10-25", category: "travel", payMethod: "card" },
  ];

  beforeEach(() => {
    cy.login(userId);
  });

  context("Displaying Expenses", () => {
    it("should show 'no entries yet' when there are no expenses", () => {
      cy.intercept("GET", `/api/expenses/user/${userId}`, { body: [] }).as("getExpenses");
      cy.visit("/expenses");
      cy.wait("@getExpenses");
      cy.contains("no entries yet").should("be.visible");
    });

    it("should display a list of expenses", () => {
      cy.intercept("GET", `/api/expenses/user/${userId}`, { body: mockExpenses }).as("getExpenses");
      cy.visit("/expenses");
      cy.wait("@getExpenses");
      cy.contains("Lunch").should("be.visible");
      cy.contains("Train ticket").should("be.visible");
      cy.get(".divide-y > div").should("have.length", 2);
    });
  });

  context("Creating a new expense", () => {
    beforeEach(() => {
      cy.intercept("GET", `/api/expenses/user/${userId}`, { body: [] }).as("getInitialExpenses");
      cy.visit("/expenses");
      cy.wait("@getInitialExpenses");
    });

    it("should show an error if required fields are empty", () => {
      cy.get("button").contains("record").click();
      cy.contains("Please fill in all fields.").should("be.visible");
    });

    it("should show an error for a non-positive amount", () => {
      cy.get('input[type="number"]').type("-50");
      cy.get('input[type="text"]').first().type("Invalid Amount");
      cy.get('input[type="date"]').type("2023-10-26");
      cy.get("select").eq(0).select("food");
      cy.get("select").eq(1).select("cash");
      cy.get("button").contains("record").click();
      cy.contains("Amount must be a positive number.").should("be.visible");
    });

    it("should successfully create a new expense", () => {
      cy.intercept("POST", `/api/expenses/user/${userId}`, { statusCode: 201 }).as("createExpense");

      const newExpense = { id: 3, amount: "500", description: "Coffee", expenseDate: "2023-10-27", category: "food", payMethod: "upi" };
      cy.intercept("GET", `/api/expenses/user/${userId}`, { body: [newExpense] }).as("getUpdatedExpenses");

      cy.get('input[type="number"]').type(newExpense.amount);
      cy.get('input[type="text"]').first().type(newExpense.description);
      cy.get('input[type="date"]').type(newExpense.expenseDate);
      cy.get("select").eq(0).select(newExpense.category);
      cy.get("select").eq(1).select(newExpense.payMethod);

      cy.get("button").contains("record").click();

      cy.wait("@createExpense").its("request.body").should("deep.include", {
        amount: newExpense.amount,
        description: newExpense.description,
        category: newExpense.category,
      });

      cy.wait("@getUpdatedExpenses");
      cy.contains(newExpense.description).should("be.visible");
      cy.get('input[type="number"]').should("have.value", "");
    });
  });

  context("Pagination", () => {
    const generateExpenses = (count) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        amount: `${100 + i}`,
        description: `Expense ${i + 1}`,
        expenseDate: "2023-10-26",
        category: "miscellaneous",
        payMethod: "cash",
      }));
    };

    it("should change items per page", () => {
      const expenses = generateExpenses(20);
      cy.intercept("GET", `/api/expenses/user/${userId}`, { body: expenses }).as("getExpenses");
      cy.visit("/expenses");
      cy.wait("@getExpenses");

      cy.get(".divide-y > div").should("have.length", 10);
      cy.contains("page 1 of 2").should("be.visible");

      cy.get('select').last().select("5");
      cy.get(".divide-y > div").should("have.length", 5);
      cy.contains("page 1 of 4").should("be.visible");
    });
  });
});

describe("Debts Page", () => {
  const userId = "test-user-123";
  const mockDebts = [
    { id: 1, amount: "5000", description: "Rent", debtDate: "2023-10-01", lender: "Landlord" },
    { id: 2, amount: "300", description: "Dinner", debtDate: "2023-10-15", lender: "John Doe" },
  ];

  beforeEach(() => {
    cy.login(userId);
  });

  it("should display a list of debts and the total", () => {
    cy.intercept("GET", `/api/debts/user/${userId}`, { body: mockDebts }).as("getDebts");
    cy.visit("/debts");
    cy.wait("@getDebts");
    cy.contains("Rent").should("be.visible");
    cy.contains("Landlord").should("be.visible");
    cy.contains("total debt: ₹5300.00").should("be.visible");
  });

  it("should successfully create a new debt", () => {
    cy.intercept("GET", `/api/debts/user/${userId}`, { body: [] }).as("getInitialDebts");
    cy.visit("/debts");
    cy.wait("@getInitialDebts");

    cy.intercept("POST", `/api/debts/user/${userId}`, { statusCode: 201 }).as("createDebt");
    const newDebt = { id: 3, amount: "1000", description: "Groceries", debtDate: "2023-10-28", lender: "Supermarket" };
    cy.intercept("GET", `/api/debts/user/${userId}`, { body: [newDebt] }).as("getUpdatedDebts");

    cy.get('input[type="number"]').type(newDebt.amount);
    cy.get('input[type="text"]').eq(0).type(newDebt.description);
    cy.get('input[type="date"]').type(newDebt.debtDate);
    cy.get('input[type="text"]').eq(1).type(newDebt.lender);
    cy.get("button").contains("record").click();

    cy.wait("@createDebt");
    cy.wait("@getUpdatedDebts");
    cy.contains("Groceries").should("be.visible");
  });

  it("should filter debts by lender", () => {
    cy.intercept("GET", `/api/debts/user/${userId}`, { body: mockDebts }).as("getDebts");
    cy.visit("/debts");
    cy.wait("@getDebts");

    cy.get('input[placeholder="Search by lender..."]').type("John");
    cy.contains("Rent").should("not.exist");
    cy.contains("Dinner").should("be.visible");
    cy.contains("total debt: ₹300.00").should("be.visible");
  });
});

describe("Loans Page", () => {
  const userId = "test-user-123";
  const mockLoans = [
    { id: 1, amount: 200, description: "For a book", loanDate: "2023-09-20", borrower: "Alice" },
    { id: 2, amount: 1500, description: "Emergency", loanDate: "2023-10-10", borrower: "Bob" },
  ];

  beforeEach(() => {
    cy.login(userId);
  });

  it("should display a list of loans and the total", () => {
    cy.intercept("GET", `/api/loans/user/${userId}`, { body: mockLoans }).as("getLoans");
    cy.visit("/loans");
    cy.wait("@getLoans");
    cy.contains("For a book").should("be.visible");
    cy.contains("Alice").should("be.visible");
    cy.contains("total loan: ₹1700.00").should("be.visible");
  });

  it("should successfully create a new loan", () => {
    cy.intercept("GET", `/api/loans/user/${userId}`, { body: [] }).as("getInitialLoans");
    cy.visit("/loans");
    cy.wait("@getInitialLoans");

    cy.intercept("POST", `/api/loans/user/${userId}`, { statusCode: 201 }).as("createLoan");
    const newLoan = { id: 3, amount: 50, description: "Coffee money", loanDate: "2023-10-28", borrower: "Charlie" };
    cy.intercept("GET", `/api/loans/user/${userId}`, { body: [newLoan] }).as("getUpdatedLoans");

    cy.get('input[type="number"]').type(newLoan.amount.toString());
    cy.get('input[type="text"]').eq(0).type(newLoan.description);
    cy.get('input[type="date"]').type(newLoan.loanDate);
    cy.get('input[type="text"]').eq(1).type(newLoan.borrower);
    cy.get("button").contains("record").click();

    cy.wait("@createLoan");
    cy.wait("@getUpdatedLoans");
    cy.contains("Coffee money").should("be.visible");
  });

  it("should filter loans by borrower", () => {
    cy.intercept("GET", `/api/loans/user/${userId}`, { body: mockLoans }).as("getLoans");
    cy.visit("/loans");
    cy.wait("@getLoans");

    cy.get('input[placeholder="Search by borrower..."]').type("Bob");
    cy.contains("For a book").should("not.exist");
    cy.contains("Emergency").should("be.visible");
    cy.contains("total loan: ₹1500.00").should("be.visible");
  });
});

describe("Analytics Page", () => {
  const userId = "test-user-123";

  const mockInsights = {
    label: "Moderate Spender",
    trend: "stable",
    topCategory: "Food",
    suggestions: ["Try to cook at home more often.", "Look for subscription deals."],
    anomalies: [{ amount: 5000, description: "Flight ticket", category: "Travel", expense_date: "2023-10-20T00:00:00.000Z" }]
  };
  const mockMonthlyBreakdown = { "September": 12000, "October": 15000 };
  const mockWeeklyBreakdown = { "Week 40": 3000, "Week 41": 3500, "Week 42": 4000 };

  beforeEach(() => {
    cy.login(userId);

    cy.intercept("GET", "**/api/analytics/insights*", { body: mockInsights }).as("getInsights");
    cy.intercept("GET", "**/api/analytics/weekly*", { body: 3500.50 }).as("getWeekly");
    cy.intercept("GET", "**/api/analytics/monthly*", { body: 15000.75 }).as("getMonthly");
    cy.intercept("GET", "**/api/analytics/yearly*", { body: 150000.00 }).as("getYearly");
    cy.intercept("GET", "**/api/analytics/monthly-breakdown*", { body: mockMonthlyBreakdown }).as("getMonthlyBreakdown");
    cy.intercept("GET", "**/api/analytics/weekly-breakdown*", { body: mockWeeklyBreakdown }).as("getWeeklyBreakdown");

    cy.visit("/analytics");
    cy.wait(["@getInsights", "@getWeekly", "@getMonthly", "@getYearly", "@getMonthlyBreakdown", "@getWeeklyBreakdown"]);
  });

  it("should display all analytics sections and data correctly", () => {
    cy.contains("this week").next().should("contain.text", "₹3500.50");
    cy.contains("this month").next().should("contain.text", "₹15000.75");
    cy.contains("this year").next().should("contain.text", "₹150000.00");

    cy.contains("p", "spending type:").should("contain.text", "moderate spender");
    cy.contains("p", "spending trend:").should("contain.text", "stable");
    cy.contains("p", "most spent category:").should("contain.text", "food");

    cy.contains("suggestions").parent().find("li").should("have.length", 2);

    cy.contains("anomalies").parent().find("li").should("contain.text", "spent ₹5000 on flight ticket for travel on - 20 october 2023");
  });

  it("should render the chart canvases", () => {
    cy.contains("category breakdown").parent().find("canvas").should("be.visible");
    cy.contains("monthly spending").parent().find("canvas").should("be.visible");
    cy.contains("weekly averages").parent().find("canvas").should("be.visible");
  });

  it("should show a loading message initially", () => {
    cy.intercept("GET", "**/api/analytics/insights*", { delay: 500, body: mockInsights }).as("getInsightsDelayed");
    cy.visit("/analytics");
    cy.contains("loading analytics...").should("be.visible");
    cy.wait("@getInsightsDelayed");
    cy.contains("loading analytics...").should("not.exist");
  });
});