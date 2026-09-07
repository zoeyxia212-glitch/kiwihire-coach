package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.RestoreAccountBackupRequest;
import com.kiwihirecoach.backend.dto.RestoreAccountBackupResponse;
import com.kiwihirecoach.backend.service.AccountBackupRestoreService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
public class AccountBackupController {
    private final AccountBackupRestoreService restoreService;

    public AccountBackupController(AccountBackupRestoreService restoreService) {
        this.restoreService = restoreService;
    }

    @PostMapping("/restore")
    public RestoreAccountBackupResponse restore(
            @Valid @RequestBody RestoreAccountBackupRequest request,
            Authentication authentication
    ) {
        return restoreService.restore(
                request.data(),
                (Long) authentication.getPrincipal()
        );
    }
}
