package com.gradquest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SkipLevelRequest(
    @NotBlank(message = "Year is required.")
    String year,

    @NotNull(message = "levelId is required.")
    @Min(value = 1, message = "levelId must be a positive integer.")
    Integer levelId
) {
}
