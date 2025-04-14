import React, { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { useAuth } from "@/context/AuthContext";
import InventoryGrid from "@/components/Inventory/InventoryGrid";
import ItemDetails from "@/components/Inventory/ItemDetails";
import { Button } from "@/components/ui/button";
import { getRandomItem } from "@/services/itemsData";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Item } from "@/types/inventory";
import { 
  Shield, 
  Sword, 
  Package, 
  Apple, 
  Hammer, 
  ScrollText 
} from "lucide-react";

const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const { inventory, addItem } = useInventory();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Функция для добавления случайного предмета в инвентарь
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weapon': return <Sword className="h-4 w-4 mr-1" />;
      case 'armor': return <Shield className="h-4 w-4 mr-1" />;
      case 'tool': return <Hammer className="h-4 w-4 mr-1" />;
      case 'consumable': return <Apple className="h-4 w-4 mr-1" />;
      case 'collectible': return <Package className="h-4 w-4 mr-1" />;
      case 'quest': return <ScrollText className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Функция для получения предметов по текущей выбранной категории
  const getFilteredItems = () => {
    if (!inventory) return [];
    
    if (activeCategory === "all") {
      return inventory.items;
    } else if (activeCategory === "equipped") {
      return inventory.items.filter(item => item.equipped);
    } else {
      return inventory.items.filter(item => item.item.category === activeCategory);
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

  const filteredItems = getFilteredItems();
  const filledSlots = inventory?.items.length || 0;
  const totalSlots = inventory?.maxSlots || 0;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Инвентарь {user.username}</h1>
            <p className="text-muted-foreground">
              Занято слотов: {filledSlots}/{totalSlots}
            </p>
          </div>
          <Button onClick={handleAddRandomItem}>
            Получить случайный предмет
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="equipped" className="flex items-center">
              Экипировано
            </TabsTrigger>
            <TabsTrigger value="weapon" className="flex items-center">
              <Sword className="h-4 w-4 mr-1" /> Оружие
            </TabsTrigger>
            <TabsTrigger value="armor" className="flex items-center">
              <Shield className="h-4 w-4 mr-1" /> Броня
            </TabsTrigger>
            <TabsTrigger value="tool" className="flex items-center">
              <Hammer className="h-4 w-4 mr-1" /> Инструменты
            </TabsTrigger>
            <TabsTrigger value="consumable" className="flex items-center">
              <Apple className="h-4 w-4 mr-1" /> Расходники
            </TabsTrigger>
            <TabsTrigger value="collectible" className="flex items-center">
              <Package className="h-4 w-4 mr-1" /> Предметы
            </TabsTrigger>
          </TabsList>
          
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((inventoryItem) => (
                    <div 
                      key={`${inventoryItem.item.id}-${inventoryItem.slot}`}
                      className="border rounded-lg p-3 flex gap-3 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setSelectedItemId(inventoryItem.item.id)}
                    >
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <img 
                          src={inventoryItem.item.icon} 
                          alt={inventoryItem.item.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">{inventoryItem.item.name}</h3>
                          {inventoryItem.quantity > 1 && (
                            <Badge variant="outline" className="text-xs">
                              x{inventoryItem.quantity}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          {getCategoryIcon(inventoryItem.item.category)}
                          <span className="text-xs text-muted-foreground">
                            {inventoryItem.item.category === 'weapon' ? 'Оружие' : 
                            inventoryItem.item.category === 'armor' ? 'Броня' : 
                            inventoryItem.item.category === 'tool' ? 'Инструмент' : 
                            inventoryItem.item.category === 'consumable' ? 'Расходник' : 
                            inventoryItem.item.category === 'collectible' ? 'Предмет' : 'Квестовый'}
                          </span>
                          {inventoryItem.equipped && (
                            <Badge className="ml-2 text-xs bg-blue-100 text-blue-800">
                              Экипировано
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">Нет предметов в этой категории</p>
                </div>
              )}
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
                    <p className="text-sm">Нажмите на предмет в списке, чтобы увидеть детали</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default InventoryPage;