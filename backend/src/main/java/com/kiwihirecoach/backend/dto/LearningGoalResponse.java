package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;
import java.time.LocalDate;

public record LearningGoalResponse(
        Long id,
        String skill,
        String reason,
        String status,
        String nextAction,
        LocalDate targetDate,
        String outcomeEvidence,
        LocalDateTime completedAt,
        Long sourceReviewId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
