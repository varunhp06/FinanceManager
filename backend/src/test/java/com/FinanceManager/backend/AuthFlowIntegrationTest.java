package com.FinanceManager.backend;

import com.FinanceManager.backend.entity.AuthRequest;
import com.FinanceManager.backend.entity.RegisterUserRequest;
import com.FinanceManager.backend.entity.User;
import com.FinanceManager.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/user/register - Successful Registration")
    void testSuccessfulRegistration() throws Exception {
        RegisterUserRequest registerRequest = new RegisterUserRequest();
        registerRequest.setUsername("testuser123");
        registerRequest.setPassword("password123");

        mockMvc.perform(post("/api/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("testuser123")))
                .andExpect(jsonPath("$.id", notNullValue()));

        User savedUser = userRepository.findByUsername("testuser123").orElse(null);
        assertNotNull(savedUser);
        assertTrue(passwordEncoder.matches("password123", savedUser.getPassword()));
    }

    @Test
    @DisplayName("POST /api/user/register - Fails when username already exists")
    void testRegistrationWithExistingUsername() throws Exception {
        User existingUser = new User();
        existingUser.setUsername("existinguser");
        existingUser.setPasswordHash(passwordEncoder.encode("password123"));
        userRepository.save(existingUser);

        RegisterUserRequest registerRequest = new RegisterUserRequest();
        registerRequest.setUsername("existinguser");
        registerRequest.setPassword("newpassword");

        mockMvc.perform(post("/api/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict());
    }


    @Test
    @DisplayName("POST /authenticate - Successful Authentication")
    void testSuccessfulAuthentication() throws Exception {
        RegisterUserRequest registerRequest = new RegisterUserRequest();
        registerRequest.setUsername("authuser");
        registerRequest.setPassword("password123");
        mockMvc.perform(post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        AuthRequest authRequest = new AuthRequest();
        authRequest.setUsername("authuser");
        authRequest.setPassword("password123");

        mockMvc.perform(post("/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(content().string(not(emptyOrNullString())));
    }

    @Test
    @DisplayName("POST /authenticate - Fails with wrong password")
    void testAuthenticationWithWrongPassword() throws Exception {
        RegisterUserRequest registerRequest = new RegisterUserRequest();
        registerRequest.setUsername("wrongpassuser");
        registerRequest.setPassword("password123");
        mockMvc.perform(post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        AuthRequest authRequest = new AuthRequest();
        authRequest.setUsername("wrongpassuser");
        authRequest.setPassword("wrongpassword");

        mockMvc.perform(post("/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(content().string(is(emptyString())));
    }


    @Test
    @DisplayName("GET /api/user/me - Access protected endpoint with valid token")
    void testAccessProtectedEndpointWithValidToken() throws Exception {
        RegisterUserRequest registerRequest = new RegisterUserRequest();
        registerRequest.setUsername("protecteduser");
        registerRequest.setPassword("password123");

        MvcResult registerResult = mockMvc.perform(post("/api/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andReturn();
        String registeredUserResponse = registerResult.getResponse().getContentAsString();
        String userId = objectMapper.readTree(registeredUserResponse).get("id").asText();

        AuthRequest authRequest = new AuthRequest();
        authRequest.setUsername("protecteduser");
        authRequest.setPassword("password123");

        MvcResult authResult = mockMvc.perform(post("/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andReturn();
        String token = authResult.getResponse().getContentAsString();

        mockMvc.perform(get("/api/user/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("protecteduser")))
                .andExpect(jsonPath("$.id", is(userId)));
    }


    @Test
    @DisplayName("GET /api/user/me - Fails to access protected endpoint without token")
    void testAccessProtectedEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/user/me - Fails to access protected endpoint with invalid token")
    void testAccessProtectedEndpointWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/user/me")
                        .header("Authorization", "Bearer invalid-token-string"))
                .andExpect(status().isForbidden());
    }
}