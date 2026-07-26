package com.kiwihirecoach.backend.dto;

import java.time.LocalDate;

public record DashboardFollowUpResponse(
        Long eventId,
        Long applicationId,
        String company,
        String roleTitle,
        String stage,
        String nextAction,
        LocalDate followUpDueDate,
        boolean overdue
) {
}
