package com.gradquest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Display name is required.")
    String displayName,

    @Email(message = "A valid email is required.")
    @NotBlank(message = "Email is required.")
    String email,

    @Size(min = 6, message = "Password must be at least 6 characters long.")
    String password,

    @NotBlank(message = "Role is required.")
    String role,

    String avatarKey
) {
}
