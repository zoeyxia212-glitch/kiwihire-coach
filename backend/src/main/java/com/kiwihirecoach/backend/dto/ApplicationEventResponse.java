package com.kiwihirecoach.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ApplicationEventResponse(
        Long id,
        Long applicationId,
        String stage,
        LocalDateTime occurredAt,
        String contactPerson,
        String notes,
        String nextAction,
        LocalDate followUpDueDate,
        boolean completed,
        LocalDateTime createdAt
) {
}
