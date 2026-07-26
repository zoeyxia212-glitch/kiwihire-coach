package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SaveResumeRequest(
        @NotBlank(message = "Resume name is required")
        @Size(max = 120, message = "Resume name is too long")
        String name,

        @Size(max = 80, message = "Resume purpose is too long")
        String purpose,

        @NotBlank(message = "Resume text is required")
        @Size(max = 50000, message = "Resume text is too long")
        String content
) {
}
