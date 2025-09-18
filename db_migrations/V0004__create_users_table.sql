-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для быстрого поиска по логину
CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);

-- Вставляем тестового пользователя
INSERT INTO users (login, password, created_at, updated_at) 
VALUES ('test_user', 'test123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (login) DO NOTHING;