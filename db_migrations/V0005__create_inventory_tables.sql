-- Создание таблицы предметов (справочник всех предметов в игре)
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL, -- weapon, armor, consumable, quest, misc
    rarity VARCHAR(50) DEFAULT 'common', -- common, uncommon, rare, epic, legendary
    icon VARCHAR(255), -- emoji или путь к изображению
    value INTEGER DEFAULT 0, -- базовая стоимость предмета
    stackable BOOLEAN DEFAULT true, -- можно ли складывать в стопки
    max_stack INTEGER DEFAULT 999, -- максимальный размер стопки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы инвентаря пользователей
CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    slot_position INTEGER, -- позиция в инвентаре (nullable для автоматического размещения)
    equipped BOOLEAN DEFAULT false, -- экипирован ли предмет
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Внешние ключи
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    
    -- Проверки
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT valid_slot_position CHECK (slot_position IS NULL OR slot_position >= 0)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_rarity ON items(rarity);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON user_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_equipped ON user_inventory(equipped) WHERE equipped = true;