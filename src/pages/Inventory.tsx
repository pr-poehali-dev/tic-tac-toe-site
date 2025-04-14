import React, { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { useAuth } from "@/context/AuthContext";
import InventoryGrid from "@/components/Inventory/InventoryGrid";
import ItemDetails from "@/components/Inventory/ItemDetails";
import { Button } from "@/components/ui/button";
import { getRandomItem } from "@/services/itemsData";

const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const { addItem } = useInventory();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Функция для демонстрации: добавляет случайный предмет в инвентарь
  const handleAddRandomItem = () => {
    const randomItem = getRandomItem();
    const quantity = Math.floor(Math.random() * 5) + 1;
    const added = addItem(randomItem, quantity);
    
    if (added) {
      console.log(`Добавлен предмет: ${randomItem.name} x${quantity}`);
    } else {
      console.error("Не удалось добавить предмет в инвентарь");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Инвентарь недоступен</h1>
          <p>Пожалуйста, войдите в систему, чтобы просмотреть свой инвентарь.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Инвентарь {user.username}</h1>
            <Button onClick={handleAddRandomItem}>
              Получить случайный предмет
            </Button>
          </div>
          
          <InventoryGrid onItemSelect={(itemId) => setSelectedItemId(itemId)} />
        </div>
        
        <div>
          {selectedItemId ? (
            <ItemDetails 
              itemId={selectedItemId} 
              onClose={() => setSelectedItemId(null)} 
            />
          ) : (
            <div className="border rounded-lg p-6 text-center h-full flex items-center justify-center">
              <div className="text-muted-foreground">
                <p className="mb-2">Выберите предмет, чтобы увидеть подробности</p>
                <p className="text-sm">Нажмите на ячейку в инвентаре, чтобы выбрать предмет</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;