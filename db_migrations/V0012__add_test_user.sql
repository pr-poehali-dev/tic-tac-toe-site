-- Добавляем тестового пользователя для удобного входа
INSERT INTO t_p94806225_tic_tac_toe_site.users (login, password) 
VALUES ('test', 'test123')
ON CONFLICT (login) DO NOTHING;