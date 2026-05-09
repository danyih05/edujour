package com.gradquest.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
    @NotBlank(message = "Display name is required.")
    String displayName,

    @NotBlank(message = "Email is required.")
    String email,

    @NotBlank(message = "Password is required.")
    String password,

    @NotBlank(message = "Role is required.")
    String role,

    String avatarKey
) {
}
