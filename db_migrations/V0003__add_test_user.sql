-- Добавляем тестового пользователя для проверки
INSERT INTO users (login, password, created_at, updated_at) 
VALUES ('test_user', 'test123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (login) DO NOTHING;