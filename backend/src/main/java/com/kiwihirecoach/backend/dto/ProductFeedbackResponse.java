package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record ProductFeedbackResponse(
        Long id,
        String category,
        int rating,
        String page,
        Boolean wouldUseAgain,
        String message,
        LocalDateTime createdAt
) {
}
