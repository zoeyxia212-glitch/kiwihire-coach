package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UpdateApplicationEventRequest(
        @NotBlank(message = "Stage is required")
        @Pattern(
                regexp = "Saved|Applied|Recruiter Screen|First Interview"
                        + "|Second Interview|Technical Interview"
                        + "|Reference Check|Offer|Rejected|Withdrawn",
                message = "Choose a valid application stage"
        )
        String stage,
        LocalDateTime occurredAt,
        @Size(max = 200)
        String contactPerson,
        @Size(max = 10000)
        String notes,
        @Size(max = 500)
        String nextAction,
        LocalDate followUpDueDate
) {
}
