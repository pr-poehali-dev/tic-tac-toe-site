import React from "react";
import { useInventory } from "@/context/InventoryContext";
import InventorySlot from "./InventorySlot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InventoryGridProps {
  onItemSelect?: (itemId: string) => void;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({ onItemSelect }) => {
  const { inventory } = useInventory();

  if (!inventory) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Инвентарь</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            Инвентарь не доступен
          </div>
        </CardContent>
      </Card>
    );
  }

  // Создаем массив из всех слотов инвентаря (включая пустые)
  const slots = Array.from({ length: inventory.maxSlots }, (_, index) => index);
  
  // Находим предмет для каждого слота (или undefined, если слот пуст)
  const slotItems = slots.map(slotIndex => {
    return inventory.items.find(item => item.slot === slotIndex);
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Инвентарь</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-1 sm:gap-2">
          {slotItems.map((inventoryItem, index) => (
            <InventorySlot 
              key={index} 
              slot={index} 
              inventoryItem={inventoryItem}
              onClick={() => {
                if (inventoryItem && onItemSelect) {
                  onItemSelect(inventoryItem.item.id);
                }
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryGrid;