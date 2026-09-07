package com.kiwihirecoach.backend.dto;

public record RestoreAccountBackupResponse(
        int applications,
        int resumes,
        int reviews,
        int timelineEvents,
        int restoredSubmissionSnapshots,
        int skippedSubmissionSnapshots
) {
}
