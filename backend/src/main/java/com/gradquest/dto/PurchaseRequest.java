package com.gradquest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PurchaseRequest(
    @NotNull(message = "itemId is required.")
    @Min(value = 1, message = "itemId must be a positive integer.")
    Long itemId
) {
}
