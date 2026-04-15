package com.gradquest.model;

public record InventoryItem(
    long id,
    long itemId,
    String slug,
    String name,
    String description,
    String category,
    String icon,
    int cost,
    int quantity,
    String acquiredAt
) {
}
