/**
 * Типы для инвентаря и предметов
 */

/**
 * Категория предмета
 */
export type ItemCategory = 'weapon' | 'armor' | 'tool' | 'consumable' | 'collectible' | 'quest';

/**
 * Редкость предмета
 */
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Интерфейс для предмета
 */
export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  icon: string; // путь к иконке предмета
  stackable: boolean; // можно ли складывать в стопку
  maxStack?: number; // максимальное количество в стопке, если stackable=true
  value: number; // ценность предмета
  usable: boolean; // можно ли использовать предмет
  tradeable: boolean; // можно ли обменивать предмет
  effects?: ItemEffect[]; // эффекты, которые дает предмет при использовании
}

/**
 * Интерфейс для эффекта предмета
 */
export interface ItemEffect {
  type: string; // тип эффекта (например, 'heal', 'damage', 'buff')
  value: number; // значение эффекта
  duration?: number; // длительность эффекта (в секундах), если временный
}

/**
 * Интерфейс для элемента инвентаря (предмет с количеством)
 */
export interface InventoryItem {
  item: Item;
  quantity: number;
  slot: number; // позиция в инвентаре
  equipped?: boolean; // экипирован ли предмет
}

/**
 * Интерфейс для инвентаря пользователя
 */
export interface Inventory {
  userId: string;
  maxSlots: number;
  items: InventoryItem[];
}
