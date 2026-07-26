package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateLearningGoalRequest(
        @NotBlank @Size(max = 120) String skill,
        @Size(max = 2000) String reason,
        Long sourceReviewId
) {
}
