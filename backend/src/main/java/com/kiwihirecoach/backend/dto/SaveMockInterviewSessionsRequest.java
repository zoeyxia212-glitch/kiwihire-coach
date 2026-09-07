package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SaveMockInterviewSessionsRequest(
        @NotNull
        @Size(max = 50)
        List<MockInterviewSession> sessions
) {
}
