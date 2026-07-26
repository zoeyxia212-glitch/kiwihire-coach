package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record ResumeResponse(
        Long id,
        String name,
        String purpose,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
