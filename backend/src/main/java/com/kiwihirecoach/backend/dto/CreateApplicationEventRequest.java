package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CreateApplicationEventRequest(
        @NotBlank(message = "Stage is required")
        String stage,
        LocalDateTime occurredAt,
        String contactPerson,
        String notes,
        String nextAction,
        LocalDate followUpDueDate
) {
}
