package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateApplicationDecisionRequest(
        @Pattern(regexp = "Pursue|Maybe|Skip") String decision,
        @Size(max = 2000) String decisionReason,
        @Size(max = 2000) String strongestFit,
        @Size(max = 2000) String mainConcern
) {
}
