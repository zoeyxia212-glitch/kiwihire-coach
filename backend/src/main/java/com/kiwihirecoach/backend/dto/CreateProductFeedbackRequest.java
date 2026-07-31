package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateProductFeedbackRequest(
        @NotBlank
        @Pattern(
                regexp = "Useful feature|Problem|Confusing experience"
                        + "|Missing feature|Other",
                message = "Choose a valid feedback category"
        )
        String category,
        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        int rating,
        @Size(max = 500)
        String page,
        Boolean wouldUseAgain,
        @NotBlank(message = "Feedback message is required")
        @Size(max = 2000)
        String message
) {
}
