package com.gradquest.repository;

import com.gradquest.model.ShopItem;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ShopRepository {

    private final JdbcTemplate jdbcTemplate;
    private final RowMapper<ShopItem> shopItemRowMapper = this::mapShopItem;

    public ShopRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ShopItem> findActiveItems() {
        return jdbcTemplate.query("""
            SELECT id, slug, name, description, cost, icon, category, is_active
            FROM shop_items
            WHERE is_active = 1
            ORDER BY cost ASC, id ASC
            """, shopItemRowMapper);
    }

    public Optional<ShopItem> findById(long itemId) {
        List<ShopItem> items = jdbcTemplate.query("""
            SELECT id, slug, name, description, cost, icon, category, is_active
            FROM shop_items
            WHERE id = ?
            """, shopItemRowMapper, itemId);
        return items.stream().findFirst();
    }

    private ShopItem mapShopItem(ResultSet resultSet, int rowNum) throws SQLException {
        return new ShopItem(
            resultSet.getLong("id"),
            resultSet.getString("slug"),
            resultSet.getString("name"),
            resultSet.getString("description"),
            resultSet.getInt("cost"),
            resultSet.getString("icon"),
            resultSet.getString("category"),
            resultSet.getInt("is_active") == 1
        );
    }
}
