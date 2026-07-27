package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.ChangePasswordRequest;
import com.kiwihirecoach.backend.dto.DeleteAccountRequest;
import com.kiwihirecoach.backend.dto.UserResponse;
import com.kiwihirecoach.backend.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public UserResponse getAccount(Authentication authentication) {
        return accountService.getAccount(currentUserId(authentication));
    }

    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        accountService.changePassword(
                currentUserId(authentication),
                request.currentPassword(),
                request.newPassword()
        );
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(
            @Valid @RequestBody DeleteAccountRequest request,
            Authentication authentication
    ) {
        accountService.deleteAccount(
                currentUserId(authentication),
                request.currentPassword(),
                request.confirmation()
        );
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }
}
