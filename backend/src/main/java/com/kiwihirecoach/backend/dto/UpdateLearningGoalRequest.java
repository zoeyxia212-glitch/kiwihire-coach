package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateLearningGoalRequest(
        @NotBlank
        @Pattern(regexp = "To learn|In progress|Completed")
        String status
) {
}
