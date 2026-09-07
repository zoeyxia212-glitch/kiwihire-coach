package com.kiwihirecoach.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

public record RestoreAccountBackupRequest(@NotNull JsonNode data) {
}
