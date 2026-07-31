package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record CandidateProfileResponse(
        Long id,
        String targetRoles,
        String workRights,
        String preferredLocations,
        String careerStage,
        String technicalSkills,
        String experienceSummary,
        String starExamples,
        LocalDateTime updatedAt
) {
}
