package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ReviewFeedbackRequest(
        @NotNull Boolean helpful,
        @Size(max = 2000) String comment,
        @Pattern(regexp = "Yes|Maybe|No") String workflowIntent
) {
}
