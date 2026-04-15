package com.gradquest.model;

public record LevelProgressRow(
    long id,
    long userId,
    String year,
    int levelId,
    String levelName,
    String status,
    int rewardCoins,
    String createdAt,
    String updatedAt
) {
}
