-- GradQuest MySQL schema reference
-- Runtime seeding for demo accounts still happens in Spring Boot on startup.

CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'student',
  coins INT NOT NULL DEFAULT 140,
  traveler_profile_json LONGTEXT NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shop_items (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cost INT NOT NULL,
  icon VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_level_progress_user ON level_progress(user_id);
CREATE INDEX idx_user_items_user ON user_items(user_id);

INSERT INTO shop_items (slug, name, description, cost, icon, category, is_active)
VALUES
  ('bear', 'XJTLU Bear', 'A cute milestone souvenir for steady progress.', 40, '🧸', 'reward', 1),
  ('movie', 'Movie Ticket', 'A small reminder that rest is part of long-term planning.', 60, '🎬', 'reward', 1),
  ('hotpot', 'Hotpot Voucher', 'Celebrate a hard-fought stretch of application work.', 80, '🍲', 'reward', 1),
  ('course', 'Advanced Course Coupon', 'A higher-value reward for sustained saving.', 100, '🎓', 'reward', 1),
  ('vocab', 'Vocabulary Book', 'A practical low-threshold study reward.', 30, '📘', 'reward', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  cost = VALUES(cost),
  icon = VALUES(icon),
  category = VALUES(category),
  is_active = VALUES(is_active);
