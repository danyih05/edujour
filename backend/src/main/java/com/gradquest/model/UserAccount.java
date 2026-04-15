package com.gradquest.model;

public record UserAccount(
    long id,
    String email,
    String username,
    String displayName,
    String passwordHash,
    UserRole role,
    int coins,
    String travelerProfileJson,
    String createdAt,
    String updatedAt,
    String lastLoginAt
) {
}
