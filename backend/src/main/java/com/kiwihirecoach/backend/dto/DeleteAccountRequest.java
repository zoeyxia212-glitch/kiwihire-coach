package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record DeleteAccountRequest(
        @NotBlank String currentPassword,
        @NotBlank String confirmation
) {
}
