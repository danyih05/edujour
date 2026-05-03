package com.gradquest.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.gradquest.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class UserRoleTest {

    @Test
    void parsesRolesCaseInsensitivelyAndTrimsWhitespace() {
        assertThat(UserRole.from(" student ")).isEqualTo(UserRole.STUDENT);
        assertThat(UserRole.from("TEACHER")).isEqualTo(UserRole.TEACHER);
    }

    @Test
    void rejectsMissingRole() {
        assertThatThrownBy(() -> UserRole.from(null))
            .isInstanceOf(ApiException.class)
            .satisfies(exception -> {
                ApiException apiException = (ApiException) exception;
                assertThat(apiException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                assertThat(apiException.getMessage()).isEqualTo("Role is required.");
            });
    }

    @Test
    void rejectsUnsupportedRole() {
        assertThatThrownBy(() -> UserRole.from("admin"))
            .isInstanceOf(ApiException.class)
            .satisfies(exception -> {
                ApiException apiException = (ApiException) exception;
                assertThat(apiException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                assertThat(apiException.getMessage()).isEqualTo("Role must be either student or teacher.");
            });
    }
}
