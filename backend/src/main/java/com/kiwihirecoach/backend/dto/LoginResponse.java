package com.kiwihirecoach.backend.dto;

public record LoginResponse(
        Long userId,
        String email,
        String token
) {
}
