import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Item, Inventory, InventoryItem } from "@/types/inventory";

interface InventoryContextType {
  inventory: Inventory | null;
  addItem: (item: Item, quantity?: number) => boolean;
  removeItem: (itemId: string, quantity?: number) => boolean;
  useItem: (itemId: string) => boolean;
  equipItem: (itemId: string, equip: boolean) => boolean;
  moveItem: (fromSlot: number, toSlot: number) => boolean;
  dropItem: (itemId: string, quantity?: number) => boolean;
  getItem: (itemId: string) => InventoryItem | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory должен использоваться внутри InventoryProvider");
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Inventory | null>(null);

  // Загрузка инвентаря пользователя
  useEffect(() => {
    if (!user) {
      setInventory(null);
      return;
    }

    // Пытаемся получить сохраненный инвентарь из localStorage
    const storedInventory = localStorage.getItem(`inventory_${user.id}`);
    
    if (storedInventory) {
      try {
        const parsedInventory = JSON.parse(storedInventory);
        setInventory(parsedInventory);
      } catch (error) {
        console.error("Ошибка при загрузке инвентаря:", error);
        createNewInventory();
      }
    } else {
      // Если инвентаря нет, создаем новый
      createNewInventory();
    }
  }, [user]);

  // Сохранение инвентаря при изменениях
  useEffect(() => {
    if (user && inventory) {
      localStorage.setItem(`inventory_${user.id}`, JSON.stringify(inventory));
    }
  }, [inventory, user]);

  // Создание нового инвентаря
  const createNewInventory = () => {
    if (!user) return;
    
    const newInventory: Inventory = {
      userId: user.id,
      maxSlots: 24, // стандартный размер инвентаря
      items: []
    };
    
    setInventory(newInventory);
  };

  // Добавление предмета в инвентарь
  const addItem = (item: Item, quantity: number = 1): boolean => {
    if (!user || !inventory) return false;
    if (quantity <= 0) return false;

    const updatedItems = [...inventory.items];
    
    // Если предмет можно складывать в стопку, ищем существующую стопку
    if (item.stackable) {
      const existingItemIndex = updatedItems.findIndex(
        (invItem) => invItem.item.id === item.id && (!item.maxStack || invItem.quantity < item.maxStack)
      );
      
      if (existingItemIndex >= 0) {
        const existingItem = updatedItems[existingItemIndex];
        const maxStack = item.maxStack || Infinity;
        const newQuantity = Math.min(existingItem.quantity + quantity, maxStack);
        
        // Обновляем количество в существующей стопке
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        };
        
        // Если осталось еще предметы (превышен maxStack), добавляем новую стопку
        const remaining = existingItem.quantity + quantity - newQuantity;
        if (remaining > 0) {
          return addItem(item, remaining); // Рекурсивный вызов для добавления остатка
        }
        
        setInventory({
          ...inventory,
          items: updatedItems
        });
        
        return true;
      }
    }
    
    // Если предмет нельзя стакать или нет подходящей стопки, добавляем новый слот
    // Сначала проверяем, есть ли свободные слоты
    if (updatedItems.length >= inventory.maxSlots) {
      console.error("Инвентарь полон");
      return false;
    }
    
    // Находим первый свободный слот
    const occupiedSlots = new Set(updatedItems.map(item => item.slot));
    let newSlot = 0;
    while (occupiedSlots.has(newSlot)) {
      newSlot++;
    }
    
    // Добавляем новый предмет
    updatedItems.push({
      item,
      quantity,
      slot: newSlot,
      equipped: false
    });
    
    setInventory({
      ...inventory,
      items: updatedItems
    });
    
    return true;
  };

  // Удаление предмета из инвентаря
  const removeItem = (itemId: string, quantity: number = 1): boolean => {
    if (!user || !inventory) return false;
    if (quantity <= 0) return false;

    const itemIndex = inventory.items.findIndex(
      (invItem) => invItem.item.id === itemId
    );
    
    if (itemIndex === -1) return false;
    
    const updatedItems = [...inventory.items];
    const itemToRemove = updatedItems[itemIndex];
    
    if (itemToRemove.quantity <= quantity) {
      // Удаляем весь стак
      updatedItems.splice(itemIndex, 1);
    } else {
      // Уменьшаем количество в стаке
      updatedItems[itemIndex] = {
        ...itemToRemove,
        quantity: itemToRemove.quantity - quantity
      };
    }
    
    setInventory({
      ...inventory,
      items: updatedItems
    });
    
    return true;
  };

  // Использование предмета
  const useItem = (itemId: string): boolean => {
    if (!user || !inventory) return false;

    const itemIndex = inventory.items.findIndex(
      (invItem) => invItem.item.id === itemId
    );
    
    if (itemIndex === -1) return false;
    
    const item = inventory.items[itemIndex];
    
    if (!item.item.usable) {
      console.error("Этот предмет нельзя использовать");
      return false;
    }
    
    // Здесь будет логика использования предмета, эффектов и т.д.
    console.log(`Использован предмет: ${item.item.name}`);
    
    // Если предмет расходуется при использовании, уменьшаем количество
    return removeItem(itemId, 1);
  };

  // Экипирование/снятие предмета
  const equipItem = (itemId: string, equip: boolean): boolean => {
    if (!user || !inventory) return false;

    const itemIndex = inventory.items.findIndex(
      (invItem) => invItem.item.id === itemId
    );
    
    if (itemIndex === -1) return false;
    
    const updatedItems = [...inventory.items];
    const item = updatedItems[itemIndex];
    
    // Если предмет уже в нужном состоянии, ничего не делаем
    if (item.equipped === equip) return true;
    
    // Если экипируем, снимаем все предметы той же категории
    if (equip) {
      const category = item.item.category;
      if (category === 'weapon' || category === 'armor') {
        updatedItems.forEach((invItem, idx) => {
          if (invItem.item.category === category && invItem.equipped) {
            updatedItems[idx] = { ...invItem, equipped: false };
          }
        });
      }
    }
    
    // Обновляем состояние экипировки
    updatedItems[itemIndex] = {
      ...item,
      equipped: equip
    };
    
    setInventory({
      ...inventory,
      items: updatedItems
    });
    
    return true;
  };

  // Перемещение предмета между слотами
  const moveItem = (fromSlot: number, toSlot: number): boolean => {
    if (!user || !inventory) return false;
    if (fromSlot === toSlot) return true;

    const updatedItems = [...inventory.items];
    
    const fromItemIndex = updatedItems.findIndex(item => item.slot === fromSlot);
    if (fromItemIndex === -1) return false;
    
    const toItemIndex = updatedItems.findIndex(item => item.slot === toSlot);
    
    if (toItemIndex === -1) {
      // Перемещение в пустой слот
      updatedItems[fromItemIndex] = {
        ...updatedItems[fromItemIndex],
        slot: toSlot
      };
    } else {
      // Обмен местами с другим предметом
      const fromItem = { ...updatedItems[fromItemIndex], slot: toSlot };
      const toItem = { ...updatedItems[toItemIndex], slot: fromSlot };
      
      updatedItems[fromItemIndex] = fromItem;
      updatedItems[toItemIndex] = toItem;
    }
    
    setInventory({
      ...inventory,
      items: updatedItems
    });
    
    return true;
  };

  // Выбрасывание предмета
  const dropItem = (itemId: string, quantity: number = 1): boolean => {
    // По сути, это то же самое, что и removeItem, но может быть расширено
    // например, для создания предмета на земле в игровом мире
    return removeItem(itemId, quantity);
  };

  // Получение предмета по ID
  const getItem = (itemId: string): InventoryItem | undefined => {
    if (!inventory) return undefined;
    return inventory.items.find(item => item.item.id === itemId);
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        addItem,
        removeItem,
        useItem,
        equipItem,
        moveItem,
        dropItem,
        getItem
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
