package com.gradquest.model;

public record ShopItem(
    long id,
    String slug,
    String name,
    String description,
    int cost,
    String icon,
    String category,
    boolean active
) {
}
