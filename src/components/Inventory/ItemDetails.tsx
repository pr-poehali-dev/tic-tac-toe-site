import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/context/InventoryContext";
import { Badge } from "@/components/ui/badge";

interface ItemDetailsProps {
  itemId: string;
  onClose: () => void;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({ itemId, onClose }) => {
  const { getItem, useItem, dropItem } = useInventory();
  
  const inventoryItem = getItem(itemId);
  
  if (!inventoryItem) {
    return null;
  }
  
  const { item, quantity } = inventoryItem;
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };
  
  const handleUse = () => {
    useItem(itemId);
  };
  
  const handleDrop = () => {
    if (window.confirm(`Вы уверены, что хотите выбросить ${item.name}?`)) {
      dropItem(itemId, quantity);
      onClose();
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{item.name}</CardTitle>
            <p className={`text-sm ${getRarityColor(item.rarity)}`}>
              {item.rarity === 'common' ? 'Обычный' : 
               item.rarity === 'uncommon' ? 'Необычный' : 
               item.rarity === 'rare' ? 'Редкий' : 
               item.rarity === 'epic' ? 'Эпический' : 'Легендарный'} предмет
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center py-2">
          <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
            <img src={item.icon} alt={item.name} className="max-w-full max-h-full" />
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">Описание</h4>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        

        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Категория:</span>{' '}
            <span>
              {item.category === 'weapon' ? 'Оружие' : 
               item.category === 'armor' ? 'Броня' : 
               item.category === 'tool' ? 'Инструмент' : 
               item.category === 'consumable' ? 'Расходник' : 
               item.category === 'collectible' ? 'Коллекционный' : 'Квестовый'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Ценность:</span> <span>{item.value}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Количество:</span> <span>{quantity}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Можно обменять:</span>{' '}
            <span>{item.tradeable ? 'Да' : 'Нет'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClose}
        >
          Закрыть
        </Button>
        <div className="flex gap-2">
          {item.usable && (
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handleUse}
            >
              Использовать
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDrop}
          >
            Выбросить
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ItemDetails;