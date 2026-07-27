package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record DashboardReminderResponse(
        String type,
        Long applicationId,
        String company,
        String roleTitle,
        String title,
        LocalDateTime dueAt
) {
}
