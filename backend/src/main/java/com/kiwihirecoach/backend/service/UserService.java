package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.LoginRequest;
import com.kiwihirecoach.backend.dto.LoginResponse;
import com.kiwihirecoach.backend.dto.RegisterRequest;
import com.kiwihirecoach.backend.dto.UserResponse;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.DuplicateEmailException;
import com.kiwihirecoach.backend.exception.InvalidCredentialsException;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new DuplicateEmailException(
                    "An account already exists for this email."
            );
        }

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(request.password()),
                LocalDateTime.now()
        );

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getCreatedAt()
        );
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        User user = userRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        )) {
            throw invalidCredentials();
        }

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                jwtService.generateToken(user)
        );
    }

    private InvalidCredentialsException invalidCredentials() {
        return new InvalidCredentialsException(
                "Email or password is incorrect."
        );
    }
}
