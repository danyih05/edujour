package com.gradquest.data;

import com.gradquest.model.LevelDefinition;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class LevelCatalog {

    private final Map<String, List<LevelDefinition>> levelsByYear = new LinkedHashMap<>();

    public LevelCatalog() {
        levelsByYear.put("y2", List.of(
            new LevelDefinition("y2", 1, "Identity Forge", 30),
            new LevelDefinition("y2", 2, "Region Choice", 30),
            new LevelDefinition("y2", 3, "Tier Mapping", 30),
            new LevelDefinition("y2", 4, "Senior Case Archives", 30),
            new LevelDefinition("y2", 5, "Action Plan", 30),
            new LevelDefinition("y2", 6, "Contract Guardian", 30),
            new LevelDefinition("y2", 7, "Final Trial", 30)
        ));
        levelsByYear.put("y3", List.of(
            new LevelDefinition("y3", 1, "Timeline Crucible", 30),
            new LevelDefinition("y3", 2, "Material Types", 30),
            new LevelDefinition("y3", 3, "CV Surgery", 30),
            new LevelDefinition("y3", 4, "PS Weaving", 30),
            new LevelDefinition("y3", 5, "Recommendation", 30),
            new LevelDefinition("y3", 6, "Exam Combat", 30),
            new LevelDefinition("y3", 7, "Risk Scan", 30),
            new LevelDefinition("y3", 8, "Coronation", 30)
        ));
    }

    public List<String> getYears() {
        return new ArrayList<>(levelsByYear.keySet());
    }

    public List<LevelDefinition> getLevelsByYear(String year) {
        return levelsByYear.getOrDefault(year, List.of());
    }

    public Optional<LevelDefinition> getLevel(String year, int levelId) {
        return getLevelsByYear(year).stream()
            .filter(level -> level.id() == levelId)
            .findFirst();
    }

    public Optional<LevelDefinition> getNextLevel(String year, int levelId) {
        List<LevelDefinition> levels = getLevelsByYear(year);
        for (int index = 0; index < levels.size(); index++) {
            if (levels.get(index).id() == levelId) {
                return index + 1 < levels.size() ? Optional.of(levels.get(index + 1)) : Optional.empty();
            }
        }
        return Optional.empty();
    }

    public List<LevelDefinition> getAllLevels() {
        return levelsByYear.values().stream().flatMap(List::stream).toList();
    }

    public int getTotalLevelCount() {
        return getAllLevels().size();
    }
}
