package com.gradquest.repository;

import com.gradquest.model.LevelDefinition;
import com.gradquest.model.LevelProgressRow;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ProgressRepository {

    private final JdbcTemplate jdbcTemplate;
    private final RowMapper<LevelProgressRow> progressRowMapper = this::mapProgress;

    public ProgressRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void createDefaultRows(long userId, List<LevelDefinition> levels) {
        String sql = """
            INSERT INTO level_progress (user_id, `year`, level_id, level_name, status, reward_coins, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """;
        for (LevelDefinition level : levels) {
            String status = level.id() == 1 ? "unlocked" : "locked";
            jdbcTemplate.update(sql, userId, level.year(), level.id(), level.name(), status, level.rewardCoins());
        }
    }

    public List<LevelProgressRow> findByUserId(long userId) {
        return jdbcTemplate.query("""
            SELECT id, user_id, `year`, level_id, level_name, status, reward_coins, created_at, updated_at
            FROM level_progress
            WHERE user_id = ?
            ORDER BY CASE `year` WHEN 'y2' THEN 1 WHEN 'y3' THEN 2 ELSE 3 END, level_id
            """, progressRowMapper, userId);
    }

    public Optional<LevelProgressRow> findByUserIdAndLevel(long userId, String year, int levelId) {
        List<LevelProgressRow> rows = jdbcTemplate.query("""
            SELECT id, user_id, `year`, level_id, level_name, status, reward_coins, created_at, updated_at
            FROM level_progress
            WHERE user_id = ? AND `year` = ? AND level_id = ?
            """, progressRowMapper, userId, year, levelId);
        return rows.stream().findFirst();
    }

    public void updateStatus(long userId, String year, int levelId, String status) {
        jdbcTemplate.update("""
            UPDATE level_progress
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND `year` = ? AND level_id = ?
            """, status, userId, year, levelId);
    }

    public void deleteByUserId(long userId) {
        jdbcTemplate.update("DELETE FROM level_progress WHERE user_id = ?", userId);
    }

    private LevelProgressRow mapProgress(ResultSet resultSet, int rowNum) throws SQLException {
        return new LevelProgressRow(
            resultSet.getLong("id"),
            resultSet.getLong("user_id"),
            resultSet.getString("year"),
            resultSet.getInt("level_id"),
            resultSet.getString("level_name"),
            resultSet.getString("status"),
            resultSet.getInt("reward_coins"),
            resultSet.getString("created_at"),
            resultSet.getString("updated_at")
        );
    }
}
