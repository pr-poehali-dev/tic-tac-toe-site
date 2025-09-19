-- Создаем таблицы для системы игровых комнат

-- Таблица игровых комнат
CREATE TABLE IF NOT EXISTS game_rooms (
    id VARCHAR(50) PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL UNIQUE,
    creator_id INTEGER NOT NULL,
    current_turn_player_id INTEGER NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting', -- waiting, playing, finished
    winner_user_id INTEGER NULL,
    board JSONB NOT NULL DEFAULT '[null,null,null,null,null,null,null,null,null]',
    game_data JSONB NULL, -- дополнительные данные игры
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE NULL,
    finished_at TIMESTAMP WITH TIME ZONE NULL,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    bot_check_scheduled BOOLEAN NOT NULL DEFAULT FALSE
);

-- Таблица игроков в комнатах
CREATE TABLE IF NOT EXISTS game_room_players (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL,
    symbol VARCHAR(2) NOT NULL, -- X или O
    is_bot BOOLEAN NOT NULL DEFAULT FALSE,
    stake_item_id INTEGER NULL, -- ID предмета который игрок поставил на кон
    stake_item_name VARCHAR(255) NULL, -- название предмета (для истории)
    stake_item_value INTEGER NULL, -- стоимость предмета (для истории)
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Уникальные ограничения
ALTER TABLE game_room_players ADD CONSTRAINT unique_room_user UNIQUE(room_id, user_id);
ALTER TABLE game_room_players ADD CONSTRAINT unique_room_symbol UNIQUE(room_id, symbol);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_created_at ON game_rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_game_rooms_last_activity ON game_rooms(last_activity);
CREATE INDEX IF NOT EXISTS idx_game_room_players_room_id ON game_room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_room_players_user_id ON game_room_players(user_id);