package com.kiwihirecoach.backend.dto;

import java.util.List;

public record DashboardResponse(
        int totalApplications,
        long interviewApplications,
        long dueToday,
        long overdue,
        List<DashboardFollowUpResponse> followUps,
        List<DashboardApplicationResponse> recentApplications
) {
}
