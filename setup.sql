-- Database setup script for adding User Roles
-- Run this script in your MySQL database 'group_task' to initialize roles

-- 1. Create the user_role table if it does not exist
CREATE TABLE IF NOT EXISTS user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Seed the default roles
INSERT INTO user_role (id, name) 
VALUES (1, 'admin'), (2, 'khách hàng')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 3. Add the role_id foreign key column to users (Hibernate automatically does this on start if ddl-auto=update is active)
-- If executing manually, uncomment the lines below:
-- ALTER TABLE users ADD COLUMN role_id BIGINT;
-- ALTER TABLE users ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES user_role(id);

-- 4. Assign the default 'khách hàng' role to any existing users without a role
-- UPDATE users SET role_id = 2 WHERE role_id IS NULL;
