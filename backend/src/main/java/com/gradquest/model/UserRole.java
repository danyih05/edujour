package com.gradquest.model;

import com.gradquest.exception.ApiException;
import org.springframework.http.HttpStatus;

public enum UserRole {
    STUDENT("student"),
    TEACHER("teacher");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static UserRole from(String rawValue) {
        if (rawValue == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Role is required.");
        }
        String normalized = rawValue.trim().toLowerCase();
        for (UserRole role : values()) {
            if (role.value.equals(normalized)) {
                return role;
            }
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, "Role must be either student or teacher.");
    }
}
