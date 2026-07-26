package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record DashboardApplicationResponse(
        Long id,
        String company,
        String roleTitle,
        String status,
        LocalDateTime createdAt
) {
}
