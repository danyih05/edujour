CREATE DATABASE IF NOT EXISTS gradquest
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'gradquest'@'localhost' IDENTIFIED BY 'GradQuest123!';
GRANT ALL PRIVILEGES ON gradquest.* TO 'gradquest'@'localhost';
FLUSH PRIVILEGES;
