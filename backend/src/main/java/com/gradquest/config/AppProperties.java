package com.gradquest.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String clientOrigins = "http://localhost:5173";
    private final Jwt jwt = new Jwt();
    private final Gameplay gameplay = new Gameplay();

    public String getClientOrigins() {
        return clientOrigins;
    }

    public void setClientOrigins(String clientOrigins) {
        this.clientOrigins = clientOrigins;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public Gameplay getGameplay() {
        return gameplay;
    }

    public static class Jwt {
        private String secret = "gradquest-dev-secret-change-me";
        private long expirationDays = 7;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getExpirationDays() {
            return expirationDays;
        }

        public void setExpirationDays(long expirationDays) {
            this.expirationDays = expirationDays;
        }
    }

    public static class Gameplay {
        private int initialCoins = 140;

        public int getInitialCoins() {
            return initialCoins;
        }

        public void setInitialCoins(int initialCoins) {
            this.initialCoins = initialCoins;
        }
    }
}
