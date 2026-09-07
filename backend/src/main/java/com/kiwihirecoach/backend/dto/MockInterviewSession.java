package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record MockInterviewSession(
        LocalDateTime completedAt,
        int questionCount,
        int confidence,
        String improvementNotes
) {
}
