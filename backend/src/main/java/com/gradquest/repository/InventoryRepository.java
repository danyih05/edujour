package com.gradquest.repository;

import com.gradquest.model.InventoryItem;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class InventoryRepository {

    private final JdbcTemplate jdbcTemplate;
    private final RowMapper<InventoryItem> inventoryRowMapper = this::mapInventoryItem;

    public InventoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<InventoryItem> findByUserIdAndItemId(long userId, long itemId) {
        List<InventoryItem> items = jdbcTemplate.query("""
            SELECT ui.id, ui.item_id, si.slug, si.name, si.description, si.category, si.icon, si.cost, ui.quantity, ui.created_at
            FROM user_items ui
            JOIN shop_items si ON si.id = ui.item_id
            WHERE ui.user_id = ? AND ui.item_id = ?
            """, inventoryRowMapper, userId, itemId);
        return items.stream().findFirst();
    }

    public List<InventoryItem> findByUserId(long userId) {
        return jdbcTemplate.query("""
            SELECT ui.id, ui.item_id, si.slug, si.name, si.description, si.category, si.icon, si.cost, ui.quantity, ui.created_at
            FROM user_items ui
            JOIN shop_items si ON si.id = ui.item_id
            WHERE ui.user_id = ?
            ORDER BY ui.created_at DESC, ui.id DESC
            """, inventoryRowMapper, userId);
    }

    public void create(long userId, long itemId) {
        jdbcTemplate.update("""
            INSERT INTO user_items (user_id, item_id, quantity, created_at, updated_at)
            VALUES (?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """, userId, itemId);
    }

    public void deleteByUserId(long userId) {
        jdbcTemplate.update("DELETE FROM user_items WHERE user_id = ?", userId);
    }

    private InventoryItem mapInventoryItem(ResultSet resultSet, int rowNum) throws SQLException {
        return new InventoryItem(
            resultSet.getLong("id"),
            resultSet.getLong("item_id"),
            resultSet.getString("slug"),
            resultSet.getString("name"),
            resultSet.getString("description"),
            resultSet.getString("category"),
            resultSet.getString("icon"),
            resultSet.getInt("cost"),
            resultSet.getInt("quantity"),
            resultSet.getString("created_at")
        );
    }
}
