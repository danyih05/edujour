package com.gradquest.data;

import com.gradquest.model.ShopItem;
import java.sql.ResultSet;
import java.util.List;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer {

    private static final String USERS_TABLE_SQL = """
        CREATE TABLE IF NOT EXISTS users (
          id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
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
