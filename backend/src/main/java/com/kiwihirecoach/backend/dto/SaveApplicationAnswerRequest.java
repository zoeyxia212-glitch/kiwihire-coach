package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SaveApplicationAnswerRequest(
        @NotBlank @Size(max = 500) String question,
        @NotBlank @Size(max = 5000) String answer,
        @Size(max = 1000) String tags,
        @Size(max = 500) String roleTypes
) {
}
