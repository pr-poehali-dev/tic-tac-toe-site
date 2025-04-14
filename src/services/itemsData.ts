import { Item, ItemCategory, ItemRarity } from "@/types/inventory";

// Генератор уникальных ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Список доступных предметов
export const ITEMS: Item[] = [
  // Оружие
  {
    id: "weapon_1",
    name: "Деревянный меч",
    description: "Простой деревянный меч. Не очень эффективный, но лучше, чем ничего.",
    category: "weapon",
    rarity: "common",
    icon: "/placeholder.svg",
    stackable: false,
    value: 10,
    usable: false,
    tradeable: true
  },
  {
    id: "weapon_2",
    name: "Железный меч",
    description: "Прочный железный меч среднего качества.",
    category: "weapon",
    rarity: "uncommon",
    icon: "/placeholder.svg",
    stackable: false,
    value: 50,
    usable: false,
    tradeable: true
  },
  {
    id: "weapon_3",
    name: "Стальной лук",
    description: "Мощный лук для дальнего боя.",
    category: "weapon",
    rarity: "rare",
    icon: "/placeholder.svg",
    stackable: false,
    value: 120,
    usable: false,
    tradeable: true
  },
  
  // Броня
  {
    id: "armor_1",
    name: "Кожаный шлем",
    description: "Легкий шлем из дубленой кожи.",
    category: "armor",
    rarity: "common",
    icon: "/placeholder.svg",
    stackable: false,
    value: 15,
    usable: false,
    tradeable: true
  },
  {
    id: "armor_2",
    name: "Железный нагрудник",
    description: "Прочный нагрудник из железных пластин.",
    category: "armor",
    rarity: "uncommon",
    icon: "/placeholder.svg",
    stackable: false,
    value: 60,
    usable: false,
    tradeable: true
  },
  
  // Инструменты
  {
    id: "tool_1",
    name: "Кирка",
    description: "Инструмент для добычи руды и камня.",
    category: "tool",
    rarity: "common",
    icon: "/placeholder.svg",
    stackable: false,
    value: 25,
    usable: true,
    tradeable: true
  },
  {
    id: "tool_2",
    name: "Удочка",
    description: "Для ловли рыбы в водоемах.",
    category: "tool",
    rarity: "common",
    icon: "/placeholder.svg",
    stackable: false,
    value: 20,
    usable: true,
    tradeable: true
  },
  
  // Расходники
  {
    id: "consumable_1",
    name: "Лечебное зелье",
    description: "Восстанавливает здоровье при использовании.",
    category: "consumable",
    rarity: "common",
    icon: "/placeholder.svg",
    stackable: true,
    maxStack: 10,
    value: 15,
    usable: true,
    tradeable: true,
    effects: [
      { type: "heal", value: 20 }
    ]
  },
  {
    id: "consumable_2",
    name: "Яблоко",
    description: "Вкусное красное яблоко. Слегка восстанавливает силы.",
    category: "consumable",
    rarity: "common",
    icon: "/placeholder.svg",
    stackable: true,
    maxStack: 20,
    value: 5,
    usable: true,
    tradeable: true,
    effects: [
      { type: "heal", value: 5 }
    ]
  },
  
  // Коллекционные предметы
  {
    id: "collectible_1",
    name: "Старинная монета",
    description: "Редкая монета из древних времен. Ценится коллекционерами.",
    category: "collectible",
    rarity: "rare",
    icon: "/placeholder.svg",
    stackable: true,
    maxStack: 50,
    value: 30,
    usable: false,
    tradeable: true
  },
  
  // Квестовые предметы
  {
    id: "quest_1",
    name: "Таинственный ключ",
    description: "Старинный ключ неизвестного происхождения. Должен открывать какую-то дверь...",
    category: "quest",
    rarity: "epic",
    icon: "/placeholder.svg",
    stackable: false,
    value: 0,
    usable: true,
    tradeable: false
  }
];

// Функция для получения случайного предмета
export const getRandomItem = (): Item => {
  const randomIndex = Math.floor(Math.random() * ITEMS.length);
  return ITEMS[randomIndex];
};

// Функция для получения предмета по ID
export const getItemById = (itemId: string): Item | undefined => {
  return ITEMS.find(item => item.id === itemId);
};

// Функция для получения предметов по категории
export const getItemsByCategory = (category: ItemCategory): Item[] => {
  return ITEMS.filter(item => item.category === category);
};

// Функция для получения предметов по редкости
export const getItemsByRarity = (rarity: ItemRarity): Item[] => {
  return ITEMS.filter(item => item.rarity === rarity);
};
