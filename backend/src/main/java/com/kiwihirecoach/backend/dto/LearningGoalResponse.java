package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record LearningGoalResponse(
        Long id,
        String skill,
        String reason,
        String status,
        Long sourceReviewId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
