package com.kiwihirecoach.backend.dto;

import java.util.List;

public record SkillGapInsightResponse(
        String skill,
        int applicationCount,
        List<String> exampleRoles,
        Long sourceReviewId,
        Long learningGoalId,
        String learningGoalStatus
) {
}
