package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateReviewSuggestionStatusRequest(
        @Min(0) int suggestionIndex,
        @NotBlank
        @Pattern(regexp = "To do|Accepted|Ignored")
        String status
) {
}
