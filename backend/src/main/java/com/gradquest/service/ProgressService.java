package com.gradquest.service;

import com.gradquest.config.AppProperties;
import com.gradquest.data.LevelCatalog;
import com.gradquest.dto.CompleteLevelRequest;
import com.gradquest.dto.SkipLevelRequest;
import com.gradquest.exception.ApiException;
import com.gradquest.model.LevelDefinition;
import com.gradquest.model.LevelProgressRow;
import com.gradquest.model.UserAccount;
import com.gradquest.model.UserRole;
import com.gradquest.repository.InventoryRepository;
import com.gradquest.repository.ProgressRepository;
import com.gradquest.repository.UserRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressService {

    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final InventoryRepository inventoryRepository;
    private final LevelCatalog levelCatalog;
    private final AppProperties appProperties;
    private final PayloadBuilder payloadBuilder;

    public ProgressService(
        UserRepository userRepository,
        ProgressRepository progressRepository,
        InventoryRepository inventoryRepository,
        LevelCatalog levelCatalog,
        AppProperties appProperties,
        PayloadBuilder payloadBuilder
    ) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.inventoryRepository = inventoryRepository;
        this.levelCatalog = levelCatalog;
        this.appProperties = appProperties;
        this.payloadBuilder = payloadBuilder;
    }

    public LinkedHashMap<String, Object> getProgress(long userId) {
        UserAccount userAccount = requireStudent(userId);
        return payloadBuilder.toProgressPayload(userAccount, progressRepository.findByUserId(userId));
    }

    @Transactional
    public LinkedHashMap<String, Object> completeLevel(long userId, CompleteLevelRequest request) {
        UserAccount userAccount = requireStudent(userId);
        LevelDefinition levelDefinition = levelCatalog.getLevel(request.year(), request.levelId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Level not found."));
        LevelProgressRow progressRow = progressRepository.findByUserIdAndLevel(userId, request.year(), request.levelId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Progress record not found."));

        if ("locked".equals(progressRow.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This level is still locked.");
        }

        int rewardCoins = request.rewardCoins() != null && request.rewardCoins() > 0
            ? request.rewardCoins()
            : levelDefinition.rewardCoins();
        int coinsAwarded = 0;

        if (!"completed".equals(progressRow.status())) {
            progressRepository.updateStatus(userId, request.year(), request.levelId(), "completed");
            userRepository.updateCoins(userId, userAccount.coins() + rewardCoins);
            coinsAwarded = rewardCoins;
        }

        if (request.profile() != null && !request.profile().isEmpty()) {
            Map<String, Object> currentProfile = payloadBuilder.parseTravelerProfile(userAccount.travelerProfileJson());
            LinkedHashMap<String, Object> mergedProfile = new LinkedHashMap<>();
            LinkedHashMap<String, Object> incomingProfile = new LinkedHashMap<>(request.profile());
            Object incomingMapAvatar = incomingProfile.remove("avatar");

            if (currentProfile != null && !currentProfile.isEmpty()) {
                mergedProfile.putAll(currentProfile);
            }

            mergedProfile.putAll(incomingProfile);
            preserveProfileField(currentProfile, mergedProfile, "avatarPreset");
            preserveProfileField(currentProfile, mergedProfile, "avatar");
            preserveGameAvatar(currentProfile, mergedProfile, incomingMapAvatar);

            userRepository.updateTravelerProfile(userId, payloadBuilder.serializeTravelerProfile(mergedProfile));
        }

        levelCatalog.getNextLevel(request.year(), request.levelId()).ifPresent(nextLevel -> {
            progressRepository.findByUserIdAndLevel(userId, nextLevel.year(), nextLevel.id()).ifPresent(nextProgress -> {
                if ("locked".equals(nextProgress.status())) {
                    progressRepository.updateStatus(userId, nextLevel.year(), nextLevel.id(), "unlocked");
                }
            });
        });

        LinkedHashMap<String, Object> payload = getProgress(userId);
        payload.put("update", buildUpdatePayload(request.year(), request.levelId(), "completed", coinsAwarded));
        return payload;
    }

    @Transactional
    public LinkedHashMap<String, Object> skipLevel(long userId, SkipLevelRequest request) {
        requireStudent(userId);
        levelCatalog.getLevel(request.year(), request.levelId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Level not found."));

        LevelProgressRow progressRow = progressRepository.findByUserIdAndLevel(userId, request.year(), request.levelId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Progress record not found."));

        if ("locked".equals(progressRow.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This level is still locked.");
        }
        if ("completed".equals(progressRow.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Completed levels cannot be skipped.");
        }

        if (!"skipped".equals(progressRow.status())) {
            progressRepository.updateStatus(userId, request.year(), request.levelId(), "skipped");
        }

        levelCatalog.getNextLevel(request.year(), request.levelId()).ifPresent(nextLevel -> {
            progressRepository.findByUserIdAndLevel(userId, nextLevel.year(), nextLevel.id()).ifPresent(nextProgress -> {
                if ("locked".equals(nextProgress.status())) {
                    progressRepository.updateStatus(userId, nextLevel.year(), nextLevel.id(), "unlocked");
                }
            });
        });

        LinkedHashMap<String, Object> payload = getProgress(userId);
        payload.put("update", buildUpdatePayload(request.year(), request.levelId(), "skipped", 0));
        return payload;
    }

    @Transactional
    public LinkedHashMap<String, Object> resetProgress(long userId) {
        requireStudent(userId);
        progressRepository.deleteByUserId(userId);
        inventoryRepository.deleteByUserId(userId);
        progressRepository.createDefaultRows(userId, levelCatalog.getAllLevels());
        userRepository.resetStudentState(userId, appProperties.getGameplay().getInitialCoins());
        return getProgress(userId);
    }

    private UserAccount requireStudent(long userId) {
        UserAccount userAccount = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
        if (userAccount.role() != UserRole.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only students can access this resource.");
        }
        return userAccount;
    }

    private LinkedHashMap<String, Object> buildUpdatePayload(String year, int levelId, String status, int coinsAwarded) {
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("year", year);
        payload.put("levelId", levelId);
        payload.put("status", status);
        payload.put("coinsAwarded", coinsAwarded);
        return payload;
    }

    private void preserveProfileField(Map<String, Object> source, LinkedHashMap<String, Object> target, String key) {
        if (source != null && source.get(key) != null) {
            target.put(key, source.get(key));
        }
    }

    private void preserveGameAvatar(
        Map<String, Object> currentProfile,
        LinkedHashMap<String, Object> mergedProfile,
        Object incomingMapAvatar
    ) {
        if (incomingMapAvatar instanceof Map<?, ?> avatarMap && !avatarMap.isEmpty()) {
            LinkedHashMap<String, Object> normalizedMapAvatar = new LinkedHashMap<>();
            avatarMap.forEach((key, value) -> {
                if (key instanceof String stringKey) {
                    normalizedMapAvatar.put(stringKey, value);
                }
            });
            mergedProfile.put("mapAvatar", normalizedMapAvatar);
            return;
        }

        preserveProfileField(currentProfile, mergedProfile, "mapAvatar");
    }
}
