package com.kiwihirecoach.backend.dto;

public record ReviewQuestion(
        String question,
        String reason,
        String answerGuide,
        String relatedSkill
) {
}
