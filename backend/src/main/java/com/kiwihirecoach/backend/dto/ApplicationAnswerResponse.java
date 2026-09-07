package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record ApplicationAnswerResponse(
        Long id,
        String question,
        String answer,
        String tags,
        String roleTypes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
