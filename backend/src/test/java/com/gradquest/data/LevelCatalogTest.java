package com.gradquest.data;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class LevelCatalogTest {

    private final LevelCatalog levelCatalog = new LevelCatalog();

    @Test
    void exposesYearsInGameplayOrder() {
        assertThat(levelCatalog.getYears()).containsExactly("y2", "y3");
    }

    @Test
    void returnsKnownLevelDefinitions() {
        assertThat(levelCatalog.getLevel("y3", 8))
            .isPresent()
            .get()
            .satisfies(level -> {
                assertThat(level.name()).isEqualTo("Coronation");
                assertThat(level.rewardCoins()).isEqualTo(30);
            });
    }

    @Test
    void returnsNextLevelWhenOneExists() {
        assertThat(levelCatalog.getNextLevel("y2", 6))
            .isPresent()
            .get()
            .satisfies(level -> {
                assertThat(level.id()).isEqualTo(7);
                assertThat(level.name()).isEqualTo("Final Trial");
            });
    }

    @Test
    void returnsEmptyForUnknownOrFinalLevels() {
        assertThat(levelCatalog.getLevel("y9", 1)).isEmpty();
        assertThat(levelCatalog.getNextLevel("y3", 8)).isEmpty();
        assertThat(levelCatalog.getNextLevel("y2", 99)).isEmpty();
    }

    @Test
    void countsEveryConfiguredLevel() {
        assertThat(levelCatalog.getTotalLevelCount()).isEqualTo(15);
        assertThat(levelCatalog.getAllLevels()).hasSize(15);
    }
}
