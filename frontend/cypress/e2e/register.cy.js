describe('Register Page', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('renders all static components', () => {
    cy.get('[data-test="register-box"]').should('exist');
    cy.get('[data-test="register-header"]').contains(/register/i);
    cy.get('[data-test="register-username"]').should('exist');
    cy.get('[data-test="register-password"]').should('exist');
    cy.get('[data-test="toggle-register-password"]').contains(/show/i);
    cy.get('[data-test="register-button"]').contains(/create account/i);
    cy.get('[data-test="go-to-login"]').contains(/login/i);
  });

  it('allows typing in username and password', () => {
    cy.get('[data-test="register-username"]').type('new_user').should('have.value', 'new_user');
    cy.get('[data-test="register-password"]').type('secretpass').should('have.value', 'secretpass');
  });

  it('toggles password visibility', () => {
    cy.get('[data-test="register-password"]').type('pass123');
    cy.get('[data-test="toggle-register-password"]').click();
    cy.get('[data-test="register-password"]').should('have.attr', 'type', 'text');
    cy.get('[data-test="toggle-register-password"]').click();
    cy.get('[data-test="register-password"]').should('have.attr', 'type', 'password');
  });

  it('navigates to login page on clicking login button', () => {
    cy.get('[data-test="go-to-login"]').click();
    cy.url().should('eq', 'http://localhost:5173/login');
  });

  it('shows error if fields are empty', () => {
    cy.get('[data-test="register-button"]').click();
    cy.get('[data-test="register-error"]').should('contain', 'please fill out both fields');
  });

  it('handles username taken error', () => {
    cy.intercept('POST', '/api/user/register', {
      statusCode: 409,
      body: {},
    }).as('registerFail');

    cy.get('[data-test="register-username"]').type('existing_user');
    cy.get('[data-test="register-password"]').type('any_pass');
    cy.get('[data-test="register-button"]').click();
    cy.get('[data-test="register-error"]').should('contain', 'username taken');
  });

  it('registers successfully and navigates to login', () => {
    cy.intercept('POST', '/api/user/register', {
      statusCode: 200,
      body: {},
    }).as('registerSuccess');

    cy.get('[data-test="register-username"]').type('test_register_1');
    cy.get('[data-test="register-password"]').type('strongpassword');
    cy.get('[data-test="register-button"]').click();
    cy.url().should('eq', 'http://localhost:5173/login');
  });
});
