package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.Size;

public record SaveCandidateProfileRequest(
        @Size(max = 300) String targetRoles,
        @Size(max = 120) String workRights,
        @Size(max = 300) String preferredLocations,
        @Size(max = 80) String careerStage,
        @Size(max = 1000) String technicalSkills,
        @Size(max = 5000) String experienceSummary,
        @Size(max = 10000) String starExamples
) {
}
