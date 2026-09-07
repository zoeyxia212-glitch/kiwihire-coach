package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateApplicationAnswersRequest(
        @NotNull List<@NotNull Long> applicationAnswerIds
) {
}
