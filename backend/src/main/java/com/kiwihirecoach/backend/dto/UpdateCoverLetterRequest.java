package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.Size;

public record UpdateCoverLetterRequest(
        @Size(max = 10000) String coverLetterDraft
) {
}
