package com.gradquest.service;

import com.gradquest.model.UserRole;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class AvatarPresetService {

    private static final Map<String, Map<String, Object>> PRESETS = Map.of(
        "north-star", Map.of(
            "hairColor", "#4c3428",
            "outfitColor", "#f0cb78",
            "skinTone", "#ffe3c0",
            "accentColor", "#ffb870",
            "hairStyle", "short",
            "hatStyle", "cap",
            "hatColor", "#355c54"
        ),
        "sunrise-note", Map.of(
            "hairColor", "#84513c",
            "outfitColor", "#f4a7aa",
            "skinTone", "#f8d8bf",
            "accentColor", "#ff9966",
            "hairStyle", "long",
            "glasses", true,
            "glassesStyle", "round",
            "frameColor", "#8b5e3c"
        ),
        "forest-spark", Map.of(
            "hairColor", "#31483f",
            "outfitColor", "#96d3a0",
            "skinTone", "#f2d5b6",
            "accentColor", "#63c17d",
            "hairStyle", "short",
            "glasses", true,
            "glassesStyle", "square",
            "frameColor", "#426459"
        ),
        "midnight-wave", Map.of(
            "hairColor", "#2c3442",
            "outfitColor", "#8ec3f2",
            "skinTone", "#f3d7c2",
            "accentColor", "#78aef4",
            "hairStyle", "bob",
            "hatStyle", "beret",
            "hatColor", "#3c63bf"
        )
    );

    public LinkedHashMap<String, Object> buildTravelerProfile(String displayName, UserRole role, String avatarKey) {
        String resolvedKey = resolvePresetKey(role, avatarKey);
        Map<String, Object> preset = PRESETS.get(resolvedKey);

        LinkedHashMap<String, Object> avatar = new LinkedHashMap<>();
        avatar.put("presetKey", resolvedKey);
        avatar.put("hairColor", preset.get("hairColor"));
        avatar.put("outfitColor", preset.get("outfitColor"));
        avatar.put("skinTone", preset.get("skinTone"));
        avatar.put("accentColor", preset.get("accentColor"));
        putIfPresent(avatar, "hairStyle", preset.get("hairStyle"));
        putIfPresent(avatar, "frameColor", preset.get("frameColor"));
        putIfPresent(avatar, "glassesStyle", preset.get("glassesStyle"));
        putIfPresent(avatar, "hatStyle", preset.get("hatStyle"));
        putIfPresent(avatar, "hatColor", preset.get("hatColor"));
        if (Boolean.TRUE.equals(preset.get("glasses"))) {
            avatar.put("glasses", true);
        }

        LinkedHashMap<String, Object> profile = new LinkedHashMap<>();
        profile.put("name", displayName);
        profile.put("avatarPreset", resolvedKey);
        profile.put("avatar", avatar);
        return profile;
    }

    public String resolvePresetKey(UserRole role, String avatarKey) {
        String normalized = avatarKey == null ? "" : avatarKey.trim().toLowerCase();
        if (PRESETS.containsKey(normalized)) {
            return normalized;
        }
        return role == UserRole.TEACHER ? "midnight-wave" : "north-star";
    }

    private void putIfPresent(LinkedHashMap<String, Object> target, String key, Object value) {
        if (value != null) {
            target.put(key, value);
        }
    }
}
