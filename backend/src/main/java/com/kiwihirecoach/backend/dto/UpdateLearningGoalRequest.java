package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateLearningGoalRequest(
        @NotBlank
        @Pattern(regexp = "To learn|In progress|Completed")
        String status,
        @Size(max = 500) String nextAction,
        LocalDate targetDate,
        @Size(max = 2000) String outcomeEvidence
) {
}
