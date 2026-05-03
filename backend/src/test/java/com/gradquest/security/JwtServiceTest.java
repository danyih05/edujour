package com.gradquest.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.gradquest.config.AppProperties;
import com.gradquest.model.UserAccount;
import com.gradquest.model.UserRole;
import io.jsonwebtoken.Claims;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    @Test
    void issueTokenIncludesUserClaimsAndConfiguredExpiry() {
        AppProperties appProperties = new AppProperties();
        appProperties.getJwt().setSecret("short-secret");
        appProperties.getJwt().setExpirationDays(3);
        JwtService jwtService = new JwtService(appProperties);

        UserAccount userAccount = new UserAccount(
            42L,
            "student@example.com",
            "student@example.com",
            "Ada",
            "hash",
            UserRole.STUDENT,
            140,
            null,
            "2026-01-01T00:00:00Z",
            "2026-01-01T00:00:00Z",
            null
        );

        Claims claims = jwtService.parseToken(jwtService.issueToken(userAccount));

        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.get("email", String.class)).isEqualTo("student@example.com");
        assertThat(claims.get("role", String.class)).isEqualTo("student");
        assertThat(claims.get("displayName", String.class)).isEqualTo("Ada");

        Instant issuedAt = claims.getIssuedAt().toInstant();
        Instant expiresAt = claims.getExpiration().toInstant();
        assertThat(Duration.between(issuedAt, expiresAt)).isEqualTo(Duration.ofDays(3));
        assertThat(issuedAt).isBeforeOrEqualTo(Instant.now());
    }
}
