package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotNull;

public record ReviewFeedbackRequest(
        @NotNull Boolean helpful
) {
}
