package com.gradquest.service;

import com.gradquest.data.LevelCatalog;
import com.gradquest.exception.ApiException;
import com.gradquest.model.UserAccount;
import com.gradquest.model.UserRole;
import com.gradquest.repository.InventoryRepository;
import com.gradquest.repository.ProgressRepository;
import com.gradquest.repository.UserRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class TeacherService {

    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final InventoryRepository inventoryRepository;
    private final LevelCatalog levelCatalog;
    private final PayloadBuilder payloadBuilder;

    public TeacherService(
        UserRepository userRepository,
        ProgressRepository progressRepository,
        InventoryRepository inventoryRepository,
        LevelCatalog levelCatalog,
        PayloadBuilder payloadBuilder
    ) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.inventoryRepository = inventoryRepository;
        this.levelCatalog = levelCatalog;
        this.payloadBuilder = payloadBuilder;
    }

    public LinkedHashMap<String, Object> getDashboard() {
        List<LinkedHashMap<String, Object>> students = userRepository.findStudentDashboardRows().stream()
            .map(this::toStudentDashboardRow)
            .toList();

        LinkedHashMap<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalStudents", students.size());
        summary.put("totalLevels", levelCatalog.getTotalLevelCount());
        summary.put("studentsWithAnyProgress", students.stream()
            .filter(student -> ((Number) student.get("completedCount")).intValue() > 0
                || ((Number) student.get("skippedCount")).intValue() > 0)
            .count());

        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("summary", summary);
        payload.put("students", students);
        return payload;
    }

    public LinkedHashMap<String, Object> getStudentDetail(long studentId) {
        UserAccount student = userRepository.findById(studentId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found."));
        if (student.role() != UserRole.STUDENT) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Student not found.");
        }

        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("student", payloadBuilder.toUserPayload(student));
        payload.put("progress", payloadBuilder.toProgressPayload(student, progressRepository.findByUserId(studentId)));
        payload.put("inventory", payloadBuilder.toInventoryPayload(inventoryRepository.findByUserId(studentId)));
        return payload;
    }

    private LinkedHashMap<String, Object> toStudentDashboardRow(Map<String, Object> row) {
        int completed = asInt(row.get("completed_count"));
        int skipped = asInt(row.get("skipped_count"));
        int unlocked = asInt(row.get("unlocked_count"));
        int locked = asInt(row.get("locked_count"));
        int totalLevels = completed + skipped + unlocked + locked;
        int done = completed + skipped;

        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", asLong(row.get("id")));
        payload.put("email", row.get("email"));
        payload.put("username", row.get("username"));
        payload.put("displayName", row.get("display_name"));
        payload.put("coins", asInt(row.get("coins")));
        payload.put("travelerProfile", payloadBuilder.parseTravelerProfile((String) row.get("traveler_profile_json")));
        payload.put("createdAt", row.get("created_at"));
        payload.put("updatedAt", row.get("updated_at"));
        payload.put("lastLoginAt", row.get("last_login_at"));
        payload.put("lastProgressAt", row.get("progress_updated_at"));
        payload.put("completedCount", completed);
        payload.put("skippedCount", skipped);
        payload.put("unlockedCount", unlocked);
        payload.put("lockedCount", locked);
        payload.put("totalLevels", totalLevels);
        payload.put("completionRate", totalLevels == 0 ? 0.0 : (double) done / totalLevels);
        return payload;
    }

    private int asInt(Object value) {
        return value == null ? 0 : ((Number) value).intValue();
    }

    private long asLong(Object value) {
        return value == null ? 0L : ((Number) value).longValue();
    }
}
