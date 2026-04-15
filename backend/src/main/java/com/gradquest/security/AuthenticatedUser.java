package com.gradquest.security;

import com.gradquest.model.UserRole;

public record AuthenticatedUser(
    long id,
    String email,
    String displayName,
    UserRole role
) {
}
