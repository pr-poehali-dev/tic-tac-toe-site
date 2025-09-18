-- Даем стартовый инвентарь всем существующим пользователям
INSERT INTO user_inventory (user_id, item_id, quantity, slot_position) 
SELECT 
    u.id as user_id,
    i.id as item_id,
    CASE 
        WHEN i.name = 'Золотая монета' THEN 100
        WHEN i.name = 'Хлеб' THEN 5
        WHEN i.name = 'Зелье здоровья' THEN 3
        ELSE 1
    END as quantity,
    NULL as slot_position
FROM users u
CROSS JOIN items i
WHERE i.name IN ('Деревянный меч', 'Золотая монета', 'Хлеб', 'Зелье здоровья')
ON CONFLICT DO NOTHING;