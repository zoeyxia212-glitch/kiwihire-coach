package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SaveEvidenceItemRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 1000) String context,
        @NotBlank @Size(max = 3000) String action,
        @NotBlank @Size(max = 2000) String result,
        @NotBlank @Size(max = 1000) String skills
) {
}
