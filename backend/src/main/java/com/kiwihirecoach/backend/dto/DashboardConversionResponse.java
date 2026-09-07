package com.kiwihirecoach.backend.dto;

public record DashboardConversionResponse(
        String label,
        long submitted,
        long reachedInterview,
        int interviewRate
) {
}
