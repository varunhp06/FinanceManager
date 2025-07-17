describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('renders all static components', () => {
    cy.get('[data-test="login-box"]').should('exist');
    cy.get('[data-test="login-header"]').contains(/login/i);
    cy.get('[data-test="login-username"]').should('exist');
    cy.get('[data-test="login-password"]').should('exist');
    cy.get('[data-test="toggle-password-visibility"]').contains(/show/i);
    cy.get('[data-test="login-button"]').contains(/enter/i);
    cy.get('[data-test="go-to-register"]').contains(/register/i);
  });

  it('allows typing in username and password', () => {
    cy.get('[data-test="login-username"]').type('john_doe').should('have.value', 'john_doe');
    cy.get('[data-test="login-password"]').type('secret').should('have.value', 'secret');
  });

  it('toggles password visibility', () => {
    cy.get('[data-test="login-password"]').type('testpass');
    cy.get('[data-test="toggle-password-visibility"]').click();
    cy.get('[data-test="login-password"]').should('have.attr', 'type', 'text');
    cy.get('[data-test="toggle-password-visibility"]').click();
    cy.get('[data-test="login-password"]').should('have.attr', 'type', 'password');
  });

  it('navigates to register page on clicking register', () => {
    cy.get('[data-test="go-to-register"]').click();
    cy.url().should('eq', 'http://localhost:5173/register');
  });

  it('logs in successfully and redirects to dashboard', () => {
    cy.intercept('POST', '/authenticate', {
      statusCode: 200,
      body: 'fake-token',
    }).as('login');

    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: { id: 'user-123' },
    }).as('me');

    cy.get('[data-test="login-username"]').type('john_doe');
    cy.get('[data-test="login-password"]').type('secretpass');
    cy.get('[data-test="login-button"]').click();

    cy.wait('@login');
    cy.wait('@me');
    cy.url().should('eq', 'http://localhost:5173/dashboard');
  });

  it('shows error on failed login', () => {
    cy.intercept('POST', '/authenticate', {
      statusCode: 401,
      body: {},
    }).as('loginFail');

    cy.get('[data-test="login-username"]').type('baduser');
    cy.get('[data-test="login-password"]').type('badpass');
    cy.get('[data-test="login-button"]').click();

    cy.wait('@loginFail');
    cy.get('[data-test="login-error"]').should('contain', 'login failed');
  });
});
