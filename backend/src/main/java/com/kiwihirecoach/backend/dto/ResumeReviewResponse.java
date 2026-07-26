package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ResumeReviewResponse(
        Long id,
        Long applicationId,
        String company,
        String roleTitle,
        Long resumeId,
        String resumeName,
        Integer score,
        List<ReviewAnalysisItem> matched,
        List<ReviewAnalysisItem> transferable,
        List<ReviewAnalysisItem> missing,
        List<String> suggestions,
        List<ReviewQuestion> questions,
        List<String> answers,
        Boolean helpful,
        LocalDateTime createdAt
) {
}
