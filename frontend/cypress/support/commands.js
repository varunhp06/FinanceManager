Cypress.Commands.add("login", (userId = "test-user-123") => {
    cy.intercept("POST", "/authenticate", {
        statusCode: 200,
        body: "fake-jwt-token",
    }).as("postAuthenticate");

    cy.intercept("GET", "/api/user/me", {
        statusCode: 200,
        body: { id: userId },
    }).as("getUserInfo");

    cy.visit("/login");

    cy.get('[data-test="login-username"]').type("testuser");
    cy.get('[data-test="login-password"]').type("password123");

    cy.get('[data-test="login-button"]').click();

    cy.wait(["@postAuthenticate", "@getUserInfo"]);

    cy.url().should("include", "/dashboard");
});
