package com.gradquest.security;

import com.gradquest.config.AppProperties;
import com.gradquest.model.UserAccount;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final Key signingKey;
    private final long expirationDays;

    public JwtService(AppProperties appProperties) {
        byte[] rawKey = appProperties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        byte[] paddedKey = new byte[Math.max(rawKey.length, 32)];
        System.arraycopy(rawKey, 0, paddedKey, 0, rawKey.length);
        this.signingKey = Keys.hmacShaKeyFor(paddedKey);
        this.expirationDays = appProperties.getJwt().getExpirationDays();
    }

    public String issueToken(UserAccount userAccount) {
        Instant now = Instant.now();
        return Jwts.builder()
            .setSubject(Long.toString(userAccount.id()))
            .claim("email", userAccount.email())
            .claim("role", userAccount.role().value())
            .claim("displayName", userAccount.displayName())
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(now.plus(expirationDays, ChronoUnit.DAYS)))
            .signWith(signingKey, SignatureAlgorithm.HS256)
            .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(signingKey)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}
