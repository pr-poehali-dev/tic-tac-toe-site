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
 * Интерфейс для предмета (упрощенный - только цена)
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
  value: number; // ценность предмета (единственная характеристика)
  usable: boolean; // можно ли использовать предмет
  tradeable: boolean; // можно ли обменивать предмет
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