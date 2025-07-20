package com.FinanceManager.backend.service;

import com.FinanceManager.backend.entity.RegisterUserRequest;
import com.FinanceManager.backend.entity.User;
import com.FinanceManager.backend.entity.UserResponse;
import com.FinanceManager.backend.error.UserAlreadyExistsException;
import com.FinanceManager.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse registerUser(RegisterUserRequest registerUserRequest){
        if (userRepository.findByUsername(registerUserRequest.getUsername()).isPresent()){
            throw new UserAlreadyExistsException("User Already Exists");
        }
        User user = new User();
        user.setUsername(registerUserRequest.getUsername());
        user.setPasswordHash(passwordEncoder.encode(registerUserRequest.getPassword()));
        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser.getId(), savedUser.getUsername());
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
