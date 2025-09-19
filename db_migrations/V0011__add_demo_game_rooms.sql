-- Добавляем тестовые данные для игровых комнат

-- Вставляем тестовую комнату в ожидании игроков
INSERT INTO game_rooms (id, room_code, creator_id, status, board, created_at, last_activity, bot_check_scheduled)
VALUES 
    ('test-room-1', 'DEMO01', 1, 'waiting', '[null,null,null,null,null,null,null,null,null]', NOW(), NOW(), false),
    ('test-room-2', 'DEMO02', 1, 'playing', '["X","O",null,"O","X",null,null,null,"X"]', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '1 minute', false);

-- Добавляем игроков в комнаты
INSERT INTO game_room_players (room_id, user_id, symbol, is_bot, stake_item_id, stake_item_name, stake_item_value, joined_at)
VALUES 
    ('test-room-1', 1, 'X', false, 1, 'Деревянный меч', 10, NOW()),
    ('test-room-2', 1, 'X', false, 1, 'Деревянный меч', 10, NOW() - INTERVAL '5 minutes'),
    ('test-room-2', 999, 'O', true, 2, 'Золотая монета', 1, NOW() - INTERVAL '4 minutes');

-- Обновляем текущий ход для играющей комнаты
UPDATE game_rooms SET current_turn_player_id = 1 WHERE id = 'test-room-2';