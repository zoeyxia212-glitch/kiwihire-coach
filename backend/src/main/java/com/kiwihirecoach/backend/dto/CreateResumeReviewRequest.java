package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateResumeReviewRequest(
        @NotNull Long applicationId,
        @NotNull Long resumeId,
        Integer score,
        List<ReviewAnalysisItem> matched,
        List<ReviewAnalysisItem> transferable,
        List<ReviewAnalysisItem> missing,
        List<String> suggestions,
        List<ReviewQuestion> questions
) {
}
