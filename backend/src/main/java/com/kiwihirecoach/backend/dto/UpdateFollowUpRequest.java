package com.kiwihirecoach.backend.dto;

import java.time.LocalDate;

public record UpdateFollowUpRequest(
        Boolean completed,
        LocalDate followUpDueDate
) {
}
