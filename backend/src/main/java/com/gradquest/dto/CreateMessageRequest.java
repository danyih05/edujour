package com.gradquest.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateMessageRequest(
    @NotBlank(message = "Message content is required.")
    @Size(min = 1, max = 280, message = "Message content must be between 1 and 280 characters.")
    String content,

    @NotNull(message = "x is required.")
    @Min(value = 0, message = "x must be between 0 and 750.")
    @Max(value = 750, message = "x must be between 0 and 750.")
    Integer x,

    @NotNull(message = "y is required.")
    @Min(value = 0, message = "y must be between 0 and 350.")
    @Max(value = 350, message = "y must be between 0 and 350.")
    Integer y,

    @Size(max = 10, message = "emoji must not exceed 10 characters.")
    String emoji
) {
}
