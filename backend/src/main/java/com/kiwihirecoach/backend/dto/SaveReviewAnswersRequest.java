package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SaveReviewAnswersRequest(
        @NotNull
        @Size(max = 50)
        List<@Size(max = 10000) String> answers
) {
}
