package com.gradquest.repository;

import com.gradquest.model.UserAccount;
import com.gradquest.model.UserRole;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;
    private final RowMapper<UserAccount> userRowMapper = this::mapUser;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<UserAccount> findById(long userId) {
        List<UserAccount> results = jdbcTemplate.query("""
            SELECT id, email, username, display_name, password_hash, role, coins,
                   traveler_profile_json, created_at, updated_at, last_login_at
            FROM users
            WHERE id = ?
            """, userRowMapper, userId);
        return results.stream().findFirst();
    }

    public Optional<UserAccount> findByEmail(String email) {
        List<UserAccount> results = jdbcTemplate.query("""
            SELECT id, email, username, display_name, password_hash, role, coins,
                   traveler_profile_json, created_at, updated_at, last_login_at
            FROM users
            WHERE email = ?
            """, userRowMapper, email);
        return results.stream().findFirst();
    }

    public Optional<UserAccount> findByUsername(String username) {
        List<UserAccount> results = jdbcTemplate.query("""
            SELECT id, email, username, display_name, password_hash, role, coins,
                   traveler_profile_json, created_at, updated_at, last_login_at
            FROM users
            WHERE username = ?
            """, userRowMapper, username);
        return results.stream().findFirst();
    }

    public UserAccount create(
        String email,
        String username,
        String displayName,
        String passwordHash,
        UserRole role,
        int coins
    ) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            var statement = connection.prepareStatement("""
                INSERT INTO users (email, username, display_name, password_hash, role, coins, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, new String[] {"id"});
            statement.setString(1, email);
            statement.setString(2, username);
            statement.setString(3, displayName);
            statement.setString(4, passwordHash);
            statement.setString(5, role.value());
            statement.setInt(6, coins);
            return statement;
        }, keyHolder);
        Number id = extractGeneratedId(keyHolder);
        return findById(id.longValue()).orElseThrow();
    }

    public void updateCoins(long userId, int coins) {
        jdbcTemplate.update("""
            UPDATE users
            SET coins = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """, coins, userId);
    }

    public void updateTravelerProfile(long userId, String travelerProfileJson) {
        jdbcTemplate.update("""
            UPDATE users
            SET traveler_profile_json = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """, travelerProfileJson, userId);
    }

    public void resetStudentState(long userId, int initialCoins) {
        jdbcTemplate.update("""
            UPDATE users
            SET coins = ?, traveler_profile_json = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """, initialCoins, userId);
    }

    public void updateLastLogin(long userId) {
        jdbcTemplate.update("""
            UPDATE users
            SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """, userId);
    }

    public List<Map<String, Object>> findStudentDashboardRows() {
        return jdbcTemplate.queryForList("""
            SELECT
              u.id,
              u.email,
              u.username,
              u.display_name,
              u.coins,
              u.traveler_profile_json,
              u.created_at,
              u.updated_at,
              u.last_login_at,
              COALESCE(SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_count,
              COALESCE(SUM(CASE WHEN lp.status = 'skipped' THEN 1 ELSE 0 END), 0) AS skipped_count,
              COALESCE(SUM(CASE WHEN lp.status = 'unlocked' THEN 1 ELSE 0 END), 0) AS unlocked_count,
              COALESCE(SUM(CASE WHEN lp.status = 'locked' THEN 1 ELSE 0 END), 0) AS locked_count,
              MAX(lp.updated_at) AS progress_updated_at
            FROM users u
            LEFT JOIN level_progress lp ON lp.user_id = u.id
            WHERE u.role = 'student'
            GROUP BY u.id, u.email, u.username, u.display_name, u.coins,
                     u.traveler_profile_json, u.created_at, u.updated_at, u.last_login_at
            ORDER BY COALESCE(MAX(lp.updated_at), u.updated_at) DESC, u.id DESC
            """);
    }

    private UserAccount mapUser(ResultSet resultSet, int rowNum) throws SQLException {
        return new UserAccount(
            resultSet.getLong("id"),
            resultSet.getString("email"),
            resultSet.getString("username"),
            resultSet.getString("display_name"),
            resultSet.getString("password_hash"),
            UserRole.from(resultSet.getString("role")),
            resultSet.getInt("coins"),
            resultSet.getString("traveler_profile_json"),
            resultSet.getString("created_at"),
            resultSet.getString("updated_at"),
            resultSet.getString("last_login_at")
        );
    }

    private Number extractGeneratedId(KeyHolder keyHolder) {
        for (Map<String, Object> keys : keyHolder.getKeyList()) {
            Object id = keys.get("id");
            if (!(id instanceof Number)) {
                id = keys.get("ID");
            }
            if (id instanceof Number number) {
                return number;
            }
            if (keys.size() == 1) {
                Object onlyValue = keys.values().iterator().next();
                if (onlyValue instanceof Number number) {
                    return number;
                }
            }
        }
        throw new IllegalStateException("Failed to retrieve generated user id.");
    }
}
