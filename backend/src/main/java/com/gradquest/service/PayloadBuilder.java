package com.gradquest.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gradquest.data.LevelCatalog;
import com.gradquest.model.InventoryItem;
import com.gradquest.model.LevelProgressRow;
import com.gradquest.model.UserAccount;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class PayloadBuilder {

    private final ObjectMapper objectMapper;
    private final LevelCatalog levelCatalog;

    public PayloadBuilder(ObjectMapper objectMapper, LevelCatalog levelCatalog) {
        this.objectMapper = objectMapper;
        this.levelCatalog = levelCatalog;
    }

    public Map<String, Object> toUserPayload(UserAccount userAccount) {
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", userAccount.id());
        payload.put("email", userAccount.email());
        payload.put("username", userAccount.username());
        payload.put("displayName", userAccount.displayName());
        payload.put("role", userAccount.role().value());
        payload.put("coins", userAccount.coins());
        payload.put("travelerProfile", parseTravelerProfile(userAccount.travelerProfileJson()));
        payload.put("createdAt", userAccount.createdAt());
        payload.put("updatedAt", userAccount.updatedAt());
        payload.put("lastLoginAt", userAccount.lastLoginAt());
        return payload;
    }

    public LinkedHashMap<String, Object> toProgressPayload(UserAccount userAccount, List<LevelProgressRow> rows) {
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("user", toUserPayload(userAccount));
        payload.put("years", buildYears(rows));
        return payload;
    }

    public LinkedHashMap<String, Object> buildYears(List<LevelProgressRow> rows) {
        LinkedHashMap<String, Object> years = new LinkedHashMap<>();
        for (String year : levelCatalog.getYears()) {
            LinkedHashMap<String, Integer> summary = new LinkedHashMap<>();
            summary.put("completed", 0);
            summary.put("skipped", 0);
            summary.put("unlocked", 0);
            summary.put("locked", 0);

            LinkedHashMap<String, Object> yearPayload = new LinkedHashMap<>();
            yearPayload.put("levels", new ArrayList<Map<String, Object>>());
            yearPayload.put("summary", summary);
            years.put(year, yearPayload);
        }

        for (LevelProgressRow row : rows) {
            @SuppressWarnings("unchecked")
            LinkedHashMap<String, Object> yearPayload = (LinkedHashMap<String, Object>) years.get(row.year());
            if (yearPayload == null) {
                continue;
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> levels = (List<Map<String, Object>>) yearPayload.get("levels");
            @SuppressWarnings("unchecked")
            Map<String, Integer> summary = (Map<String, Integer>) yearPayload.get("summary");

            LinkedHashMap<String, Object> levelPayload = new LinkedHashMap<>();
            levelPayload.put("id", row.levelId());
            levelPayload.put("name", row.levelName());
            levelPayload.put("status", row.status());
            levelPayload.put("rewardCoins", row.rewardCoins());
            levelPayload.put("unlocked", !"locked".equals(row.status()));
            levelPayload.put("completed", "completed".equals(row.status()));
            levelPayload.put("skipped", "skipped".equals(row.status()));
            levelPayload.put("updatedAt", row.updatedAt());
            levels.add(levelPayload);

            summary.put(row.status(), summary.getOrDefault(row.status(), 0) + 1);
        }

        return years;
    }

    public List<Map<String, Object>> toInventoryPayload(List<InventoryItem> items) {
        return items.stream().map(item -> {
            LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
            payload.put("id", item.id());
            payload.put("itemId", item.itemId());
            payload.put("slug", item.slug());
            payload.put("name", item.name());
            payload.put("description", item.description());
            payload.put("category", item.category());
            payload.put("icon", item.icon());
            payload.put("cost", item.cost());
            payload.put("quantity", item.quantity());
            payload.put("acquiredAt", item.acquiredAt());
            return (Map<String, Object>) payload;
        }).toList();
    }

    public Map<String, Object> parseTravelerProfile(String travelerProfileJson) {
        if (travelerProfileJson == null || travelerProfileJson.isBlank()) {
            return null;
        }
        try {
            Map<String, Object> profile = objectMapper.readValue(travelerProfileJson, new TypeReference<>() {});
            return normalizeTravelerProfile(profile);
        } catch (Exception exception) {
            return null;
        }
    }

    public String serializeTravelerProfile(Map<String, Object> travelerProfile) {
        if (travelerProfile == null || travelerProfile.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(travelerProfile);
        } catch (Exception exception) {
            return null;
        }
    }

    private Map<String, Object> normalizeTravelerProfile(Map<String, Object> travelerProfile) {
        if (travelerProfile == null || travelerProfile.isEmpty()) {
            return travelerProfile;
        }

        LinkedHashMap<String, Object> normalized = new LinkedHashMap<>(travelerProfile);
        Object avatarPreset = normalized.get("avatarPreset");
        Object avatarObject = normalized.get("avatar");

        if (!(avatarPreset instanceof String presetKey) || presetKey.isBlank()) {
            return normalized;
        }

        LinkedHashMap<String, Object> avatar = new LinkedHashMap<>();
        if (avatarObject instanceof Map<?, ?> avatarMap) {
            avatarMap.forEach((key, value) -> {
                if (key instanceof String stringKey) {
                    avatar.put(stringKey, value);
                }
            });
        }

        avatar.putIfAbsent("presetKey", presetKey);
        normalized.put("avatar", avatar);
        return normalized;
    }
}
