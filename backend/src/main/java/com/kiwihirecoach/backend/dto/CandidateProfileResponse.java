package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public record CandidateProfileResponse(
        Long id,
        String targetRoles,
        String workRights,
        String preferredLocations,
        String technicalSkills,
        String experienceSummary,
        LocalDateTime updatedAt
) {
}
