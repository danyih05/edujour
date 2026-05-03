package com.gradquest.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gradquest.data.LevelCatalog;
import com.gradquest.model.LevelProgressRow;
import com.gradquest.model.UserAccount;
import com.gradquest.model.UserRole;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class PayloadBuilderTest {

    private final PayloadBuilder payloadBuilder = new PayloadBuilder(new ObjectMapper(), new LevelCatalog());

    @Test
    void parsesTravelerProfileAndBackfillsAvatarPresetKey() {
        Map<String, Object> profile = payloadBuilder.parseTravelerProfile("""
            {
              "avatarPreset": "star",
              "avatar": {
                "color": "blue"
              },
              "motto": "Keep going"
            }
            """);

        assertThat(profile).containsEntry("motto", "Keep going");
        assertThat(profile.get("avatar"))
            .isInstanceOf(Map.class)
            .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.map(String.class, Object.class))
            .containsEntry("color", "blue")
            .containsEntry("presetKey", "star");
    }

    @Test
    void parseTravelerProfileReturnsNullForBlankOrInvalidJson() {
        assertThat(payloadBuilder.parseTravelerProfile(null)).isNull();
        assertThat(payloadBuilder.parseTravelerProfile("   ")).isNull();
        assertThat(payloadBuilder.parseTravelerProfile("{bad json")).isNull();
    }

    @Test
    void serializesNullOrEmptyTravelerProfileAsNull() {
        assertThat(payloadBuilder.serializeTravelerProfile(null)).isNull();
        assertThat(payloadBuilder.serializeTravelerProfile(Map.of())).isNull();
    }

    @Test
    void buildsUserPayloadWithNormalizedTravelerProfile() {
        UserAccount userAccount = new UserAccount(
            7L,
            "learner@example.com",
            "learner@example.com",
            "Grace",
            "hash",
            UserRole.STUDENT,
            90,
            "{\"avatarPreset\":\"moon\"}",
            "created",
            "updated",
            "last-login"
        );

        Map<String, Object> payload = payloadBuilder.toUserPayload(userAccount);

        assertThat(payload)
            .containsEntry("id", 7L)
            .containsEntry("email", "learner@example.com")
            .containsEntry("displayName", "Grace")
            .containsEntry("role", "student")
            .containsEntry("coins", 90);
        assertThat(payload.get("travelerProfile"))
            .isInstanceOf(Map.class)
            .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.map(String.class, Object.class))
            .containsEntry("avatarPreset", "moon")
            .containsKey("avatar");
    }

    @Test
    @SuppressWarnings("unchecked")
    void buildYearsCreatesSummariesAndIgnoresUnknownYears() {
        LevelProgressRow unlocked = progressRow(1L, "y2", 1, "Identity Forge", "unlocked");
        LevelProgressRow completed = progressRow(2L, "y2", 2, "Region Choice", "completed");
        LevelProgressRow skipped = progressRow(3L, "y3", 1, "Timeline Crucible", "skipped");
        LevelProgressRow ignored = progressRow(4L, "y9", 1, "Unknown", "completed");

        Map<String, Object> years = payloadBuilder.buildYears(List.of(unlocked, completed, skipped, ignored));

        assertThat(years).containsOnlyKeys("y2", "y3");
        assertYearSummary(years, "y2", 1, 0, 1, 0);
        assertYearSummary(years, "y3", 0, 1, 0, 0);

        Map<String, Object> y2 = yearPayload(years, "y2");
        List<?> levels = (List<?>) y2.get("levels");
        assertThat(levels).hasSize(2);
        assertThat((LinkedHashMap<String, Object>) levels.get(0))
            .containsEntry("id", 1)
            .containsEntry("unlocked", true)
            .containsEntry("completed", false)
            .containsEntry("skipped", false);
    }

    @SuppressWarnings("unchecked")
    private static void assertYearSummary(
        Map<String, Object> years,
        String year,
        int completed,
        int skipped,
        int unlocked,
        int locked
    ) {
        Map<String, Object> yearPayload = yearPayload(years, year);
        Map<String, Integer> summary = (Map<String, Integer>) yearPayload.get("summary");
        assertThat(summary)
            .containsEntry("completed", completed)
            .containsEntry("skipped", skipped)
            .containsEntry("unlocked", unlocked)
            .containsEntry("locked", locked);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> yearPayload(Map<String, Object> years, String year) {
        return (Map<String, Object>) years.get(year);
    }

    private static LevelProgressRow progressRow(long id, String year, int levelId, String name, String status) {
        return new LevelProgressRow(
            id,
            7L,
            year,
            levelId,
            name,
            status,
            30,
            "created",
            "updated"
        );
    }
}
