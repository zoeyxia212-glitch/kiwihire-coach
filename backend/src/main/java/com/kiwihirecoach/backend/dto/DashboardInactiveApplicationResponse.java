package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record DashboardInactiveApplicationResponse(
        Long applicationId,
        String company,
        String roleTitle,
        String status,
        LocalDateTime lastActivityAt
) {
}
