package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateReviewAnswerStatusRequest(
        @Min(0) int questionIndex,
        @NotBlank
        @Pattern(regexp = "Not started|Drafted|Ready")
        String status
) {
}
