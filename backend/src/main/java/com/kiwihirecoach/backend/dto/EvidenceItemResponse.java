package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record EvidenceItemResponse(
        Long id,
        String title,
        String context,
        String action,
        String result,
        String skills,
        Long sourceLearningGoalId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
