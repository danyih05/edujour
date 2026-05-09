package com.gradquest.data;

import com.gradquest.model.ShopItem;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer {

    private static final String USERS_TABLE_SQL = """
        CREATE TABLE IF NOT EXISTS users (
          id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          username VARCHAR(255) NOT NULL UNIQUE,
          display_name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(32) NOT NULL DEFAULT 'student',
          coins INT NOT NULL DEFAULT 140,
          traveler_profile_json TEXT NULL,
          last_login_at DATETIME NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """;

    private static final String PROGRESS_TABLE_SQL = """
        CREATE TABLE IF NOT EXISTS level_progress (
          id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT NOT NULL,
          `year` VARCHAR(16) NOT NULL,
          level_id INT NOT NULL,
          level_name VARCHAR(255) NOT NULL,
          status VARCHAR(32) NOT NULL,
          reward_coins INT NOT NULL DEFAULT 30,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uk_level_progress_user_year_level (user_id, `year`, level_id),
          CONSTRAINT fk_level_progress_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """;

    private static final String SHOP_TABLE_SQL = """
        CREATE TABLE IF NOT EXISTS shop_items (
          id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          slug VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          cost INT NOT NULL,
          icon VARCHAR(64) NOT NULL,
          category VARCHAR(64) NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """;

    private static final String USER_ITEMS_TABLE_SQL = """
        CREATE TABLE IF NOT EXISTS user_items (
          id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT NOT NULL,
          item_id BIGINT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uk_user_items_user_item (user_id, item_id),
          CONSTRAINT fk_user_items_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_user_items_item
            FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE
        )
        """;

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Bean
    ApplicationRunner initializeDatabase() {
        return args -> {
            jdbcTemplate.execute(USERS_TABLE_SQL);
            jdbcTemplate.execute(PROGRESS_TABLE_SQL);
            jdbcTemplate.execute(SHOP_TABLE_SQL);
            jdbcTemplate.execute(USER_ITEMS_TABLE_SQL);
            ensureIndex("level_progress", "idx_level_progress_user", "user_id");
            ensureIndex("user_items", "idx_user_items_user", "user_id");

            ensureColumn("users", "role", "role VARCHAR(32) NOT NULL DEFAULT 'student'");
            ensureColumn("users", "traveler_profile_json", "traveler_profile_json TEXT NULL");
            ensureColumn("users", "last_login_at", "last_login_at DATETIME NULL");
            ensureColumn("level_progress", "reward_coins", "reward_coins INT NOT NULL DEFAULT 30");
            relaxUserEmailUniqueness();
            ensureCompositeUniqueIndex("users", "uk_users_email_role", List.of("email", "role"));

            jdbcTemplate.update("UPDATE users SET role = 'student' WHERE role IS NULL OR TRIM(role) = ''");
            seedShopItems();
        };
    }

    private void ensureColumn(String tableName, String columnName, String columnDefinition) throws Exception {
        try (
            var connection = jdbcTemplate.getDataSource().getConnection();
            ResultSet columns = connection.getMetaData().getColumns(connection.getCatalog(), null, tableName, columnName)
        ) {
            if (!columns.next()) {
                jdbcTemplate.execute("ALTER TABLE " + tableName + " ADD COLUMN " + columnDefinition);
            }
        }
    }

    private void ensureIndex(String tableName, String indexName, String columnName) throws Exception {
        try (
            var connection = jdbcTemplate.getDataSource().getConnection();
            ResultSet indexes = connection.getMetaData().getIndexInfo(connection.getCatalog(), null, tableName, false, false)
        ) {
            while (indexes.next()) {
                String existingIndexName = indexes.getString("INDEX_NAME");
                if (indexName.equalsIgnoreCase(existingIndexName)) {
                    return;
                }
            }
        }
        jdbcTemplate.execute("CREATE INDEX " + indexName + " ON " + tableName + "(" + columnName + ")");
    }

    private void ensureCompositeUniqueIndex(String tableName, String indexName, List<String> columnNames) throws Exception {
        try (
            var connection = jdbcTemplate.getDataSource().getConnection();
            ResultSet indexes = connection.getMetaData().getIndexInfo(connection.getCatalog(), null, tableName, false, false)
        ) {
            while (indexes.next()) {
                String existingIndexName = indexes.getString("INDEX_NAME");
                if (indexName.equalsIgnoreCase(existingIndexName)) {
                    return;
                }
            }
        }
        jdbcTemplate.execute(
            "CREATE UNIQUE INDEX " + indexName + " ON " + tableName + "(" + String.join(", ", columnNames) + ")"
        );
    }

    private void relaxUserEmailUniqueness() throws Exception {
        dropSingleColumnEmailUniqueConstraints("users");

        List<String> uniqueEmailIndexes = new ArrayList<>();
        try (
            var connection = jdbcTemplate.getDataSource().getConnection();
            ResultSet indexes = connection.getMetaData().getIndexInfo(connection.getCatalog(), null, "users", true, false)
        ) {
            while (indexes.next()) {
                String indexName = indexes.getString("INDEX_NAME");
                String columnName = indexes.getString("COLUMN_NAME");
                boolean nonUnique = indexes.getBoolean("NON_UNIQUE");
                if (indexName == null || columnName == null || nonUnique || "PRIMARY_KEY".equalsIgnoreCase(indexName)) {
                    continue;
                }
                if ("email".equalsIgnoreCase(columnName) && isSingleColumnIndex("users", indexName)) {
                    uniqueEmailIndexes.add(indexName);
                }
            }
        }

        for (String indexName : uniqueEmailIndexes) {
            dropIndex("users", indexName);
        }
    }

    private void dropSingleColumnEmailUniqueConstraints(String tableName) {
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                """
                    SELECT tc.constraint_name, kcu.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                      ON tc.constraint_catalog = kcu.constraint_catalog
                     AND tc.constraint_schema = kcu.constraint_schema
                     AND tc.constraint_name = kcu.constraint_name
                     AND tc.table_name = kcu.table_name
                    WHERE UPPER(tc.table_name) = UPPER(?)
                      AND UPPER(tc.constraint_type) = 'UNIQUE'
                    """,
                tableName
            );

            Map<String, List<String>> columnsByConstraint = new LinkedHashMap<>();
            for (Map<String, Object> row : rows) {
                Object constraintName = getColumnValue(row, "constraint_name");
                Object columnName = getColumnValue(row, "column_name");
                if (constraintName == null || columnName == null) {
                    continue;
                }
                columnsByConstraint
                    .computeIfAbsent(constraintName.toString(), ignored -> new ArrayList<>())
                    .add(columnName.toString());
            }

            columnsByConstraint.forEach((constraintName, columnNames) -> {
                if (columnNames.size() == 1 && "email".equalsIgnoreCase(columnNames.get(0))) {
                    dropConstraint(tableName, constraintName);
                }
            });
        } catch (Exception ignored) {
            // Some databases expose unique constraints only as indexes. The index fallback below handles those.
        }
    }

    private Object getColumnValue(Map<String, Object> row, String columnName) {
        Object value = row.get(columnName);
        if (value != null) {
            return value;
        }
        return row.get(columnName.toUpperCase());
    }

    private boolean isSingleColumnIndex(String tableName, String indexName) throws Exception {
        int columnCount = 0;
        try (
            var connection = jdbcTemplate.getDataSource().getConnection();
            ResultSet indexes = connection.getMetaData().getIndexInfo(connection.getCatalog(), null, tableName, false, false)
        ) {
            while (indexes.next()) {
                String existingIndexName = indexes.getString("INDEX_NAME");
                String columnName = indexes.getString("COLUMN_NAME");
                if (indexName.equalsIgnoreCase(existingIndexName) && columnName != null) {
                    columnCount += 1;
                }
            }
        }
        return columnCount == 1;
    }

    private void dropIndex(String tableName, String indexName) {
        try {
            jdbcTemplate.execute("DROP INDEX " + indexName);
        } catch (Exception firstError) {
            try {
                jdbcTemplate.execute("DROP INDEX " + indexName + " ON " + tableName);
            } catch (Exception secondError) {
                String actualConstraintName = findUniqueConstraintNameByIndex(tableName, indexName);
                if (actualConstraintName != null) {
                    dropConstraint(tableName, actualConstraintName);
                    return;
                }
                try {
                    dropConstraint(tableName, indexName);
                    return;
                } catch (Exception thirdError) {
                    // H2 can expose generated unique constraints as CONSTRAINT_INDEX_n.
                }
                String constraintName = toH2ConstraintName(indexName);
                if (constraintName != null) {
                    dropConstraint(tableName, constraintName);
                    return;
                }
                throw secondError;
            }
        }
    }

    private void dropConstraint(String tableName, String constraintName) {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE " + tableName + " DROP CONSTRAINT IF EXISTS \"" + constraintName.replace("\"", "\"\"") + "\""
            );
        } catch (Exception firstError) {
            jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP CONSTRAINT IF EXISTS " + constraintName);
        }
    }

    private String findUniqueConstraintNameByIndex(String tableName, String indexName) {
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                """
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE UPPER(table_name) = UPPER(?)
                      AND UPPER(index_name) = UPPER(?)
                      AND UPPER(constraint_type) = 'UNIQUE'
                    """,
                tableName,
                indexName
            );
            if (rows.isEmpty()) {
                return null;
            }
            Object constraintName = getColumnValue(rows.get(0), "constraint_name");
            return constraintName == null ? null : constraintName.toString();
        } catch (Exception ignored) {
            return null;
        }
    }

    private String toH2ConstraintName(String indexName) {
        String prefix = "CONSTRAINT_INDEX_";
        if (indexName == null || !indexName.toUpperCase().startsWith(prefix)) {
            return null;
        }
        return "CONSTRAINT_" + indexName.substring(prefix.length());
    }

    private void seedShopItems() {
        List<ShopItem> defaults = List.of(
            new ShopItem(0L, "bear", "XJTLU Bear", "A cute milestone souvenir for steady progress.", 40, "\uD83E\uDDF8", "reward", true),
            new ShopItem(0L, "movie", "Movie Ticket", "A small reminder that rest is part of long-term planning.", 60, "\uD83C\uDFAC", "reward", true),
            new ShopItem(0L, "hotpot", "Hotpot Voucher", "Celebrate a hard-fought stretch of application work.", 80, "\uD83C\uDF72", "reward", true),
            new ShopItem(0L, "course", "Advanced Course Coupon", "A higher-value reward for sustained saving.", 100, "\uD83C\uDF93", "reward", true),
            new ShopItem(0L, "vocab", "Vocabulary Book", "A practical low-threshold study reward.", 30, "\uD83D\uDCD8", "reward", true)
        );

        defaults.forEach(item -> {
            Integer existing = jdbcTemplate.query(
                "SELECT 1 FROM shop_items WHERE slug = ?",
                resultSet -> resultSet.next() ? 1 : null,
                item.slug()
            );

            if (existing == null) {
                jdbcTemplate.update(
                    """
                        INSERT INTO shop_items (slug, name, description, cost, icon, category, is_active)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                    item.slug(),
                    item.name(),
                    item.description(),
                    item.cost(),
                    item.icon(),
                    item.category(),
                    item.active()
                );
                return;
            }

            jdbcTemplate.update(
                """
                    UPDATE shop_items
                    SET name = ?, description = ?, cost = ?, icon = ?, category = ?, is_active = ?
                    WHERE slug = ?
                    """,
                item.name(),
                item.description(),
                item.cost(),
                item.icon(),
                item.category(),
                item.active(),
                item.slug()
            );
        });
    }
}
