describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('renders login page with all elements', () => {
    cy.contains('login');
    cy.get('input[type="text"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.contains('enter').should('exist');
    cy.contains('register').should('exist');
  });

  it('allows input into username and password fields', () => {
    cy.get('input[type="text"]').type('john_doe').should('have.value', 'john_doe');
    cy.get('input[type="password"]').type('password123').should('have.value', 'password123');
  });

  it('toggles password visibility', () => {
    cy.contains('show').click();
    cy.get('input[type="text"]').should('have.value', '');
    cy.contains('hide').click();
    cy.get('input[type="password"]').should('exist');
  });

  it('navigates to register page on clicking register', () => {
    cy.contains('register').click();
    cy.url().should('eq', 'http://localhost:5173/register');
  });

  it('logs in successfully and redirects to dashboard', () => {
    cy.intercept('POST', '/authenticate', {
      statusCode: 200,
      body: 'fake-jwt-token',
    }).as('loginRequest');

    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: { id: '1234' },
    }).as('userInfo');

    cy.get('input[type="text"]').type('tester');
    cy.get('input[type="password"]').type('tester1234');
    cy.contains('enter').click();
    cy.url().should('eq', 'http://localhost:5173/dashboard');
  });

  it('shows error message on login failure', () => {
    cy.intercept('POST', '/authenticate', {
      statusCode: 401,
      body: {},
    }).as('failedLogin');

    cy.get('input[type="text"]').type('wrong_user');
    cy.get('input[type="password"]').type('wrong_pass');
    cy.contains('enter').click();
    cy.contains('login failed: invalid or empty credentials').should('exist');
  });
});
