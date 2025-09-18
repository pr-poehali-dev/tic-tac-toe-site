-- Создание таблицы для ставок предметами в играх
CREATE TABLE game_bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    item_id INTEGER NOT NULL REFERENCES user_inventory(id),
    bet_amount INTEGER NOT NULL DEFAULT 1, -- количество предметов в ставке
    item_value INTEGER NOT NULL, -- стоимость предмета на момент ставки
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, won, lost, returned
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ограничения
    CONSTRAINT positive_bet_amount CHECK (bet_amount > 0),
    CONSTRAINT positive_item_value CHECK (item_value > 0)
);

-- Индексы для таблицы game_bets
CREATE INDEX idx_game_bets_game_id ON game_bets(game_id);
CREATE INDEX idx_game_bets_user_id ON game_bets(user_id);
CREATE INDEX idx_game_bets_status ON game_bets(status);