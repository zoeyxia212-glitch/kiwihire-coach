package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.RegisterRequest;
import com.kiwihirecoach.backend.dto.UserResponse;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.DuplicateEmailException;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void registerNormalizesEmailHashesPasswordAndSavesUser() {
        RegisterRequest request = new RegisterRequest(
                "  Zoey@Example.com  ",
                "password123"
        );

        when(userRepository.findByEmailIgnoreCase("zoey@example.com"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123"))
                .thenReturn("hashed-password");
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("zoey@example.com", savedUser.getEmail());
        assertEquals("hashed-password", savedUser.getPasswordHash());
        assertEquals("zoey@example.com", response.email());
    }

    @Test
    void registerRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest(
                "zoey@example.com",
                "password123"
        );
        User existingUser = new User(
                "zoey@example.com",
                "existing-hash",
                LocalDateTime.now()
        );

        when(userRepository.findByEmailIgnoreCase("zoey@example.com"))
                .thenReturn(Optional.of(existingUser));

        DuplicateEmailException exception = assertThrows(
                DuplicateEmailException.class,
                () -> userService.register(request)
        );

        assertEquals(
                "An account already exists for this email.",
                exception.getMessage()
        );
        verify(userRepository, never()).save(
                org.mockito.ArgumentMatchers.any(User.class)
        );
    }
}
