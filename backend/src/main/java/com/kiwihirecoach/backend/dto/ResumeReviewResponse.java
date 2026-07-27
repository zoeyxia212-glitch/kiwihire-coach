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
        List<String> suggestionStatuses,
        List<ReviewQuestion> questions,
        List<String> answers,
        List<String> answerStatuses,
        Boolean helpful,
        String feedbackComment,
        String workflowIntent,
        LocalDateTime createdAt
) {
}
