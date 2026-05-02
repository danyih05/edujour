package com.gradquest.dto;

import java.time.LocalDateTime;

public record SandboxMessageDTO(
    Long id,
    String content,
    Integer x,
    Integer y,
    String emoji,
    Long userId,
    LocalDateTime createdAt
) {
}
