import React from "react";
import { InventoryItem } from "@/types/inventory";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface InventorySlotProps {
  slot: number;
  inventoryItem?: InventoryItem;
  onClick?: () => void;
}

const InventorySlot: React.FC<InventorySlotProps> = ({ 
  slot, 
  inventoryItem,
  onClick
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-200 border-gray-400';
      case 'uncommon': return 'bg-green-100 border-green-400';
      case 'rare': return 'bg-blue-100 border-blue-400';
      case 'epic': return 'bg-purple-100 border-purple-400';
      case 'legendary': return 'bg-amber-100 border-amber-500';
      default: return 'bg-gray-200 border-gray-400';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "w-full h-14 sm:h-16 border-2 border-muted rounded flex items-center justify-center relative cursor-pointer",
              inventoryItem ? getRarityColor(inventoryItem.item.rarity) : "bg-muted/20",
              inventoryItem?.equipped && "ring-2 ring-blue-500"
            )}
            onClick={onClick}
          >
            {inventoryItem ? (
              <>
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden">
                  <img 
                    src={inventoryItem.item.icon} 
                    alt={inventoryItem.item.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                {inventoryItem.quantity > 1 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-0 right-0 text-xs px-1"
                  >
                    {inventoryItem.quantity}
                  </Badge>
                )}
                
                {inventoryItem.equipped && (
                  <Badge 
                    variant="outline" 
                    className="absolute top-0 left-0 text-xs px-1 bg-blue-100"
                  >
                    Э
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground select-none">{slot + 1}</span>
            )}
          </div>
        </TooltipTrigger>
        {inventoryItem && (
          <TooltipContent side="right" className="w-64 p-3">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{inventoryItem.item.name}</h4>
                  <p className="text-xs text-muted-foreground capitalize">
                    {inventoryItem.item.rarity} {inventoryItem.item.category}
                  </p>
                </div>
                {inventoryItem.equipped && (
                  <Badge variant="outline" className="bg-blue-100">Экипировано</Badge>
                )}
              </div>
              <p className="text-sm">{inventoryItem.item.description}</p>
              {inventoryItem.item.effects && inventoryItem.item.effects.length > 0 && (
                <div className="text-xs space-y-1">
                  <p className="font-medium">Эффекты:</p>
                  <ul className="pl-2">
                    {inventoryItem.item.effects.map((effect, index) => (
                      <li key={index}>
                        {effect.type === 'heal' ? 'Лечение' : effect.type}: +{effect.value}
                        {effect.duration ? ` (${effect.duration} сек.)` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {inventoryItem.item.usable ? 'Можно использовать' : 'Нельзя использовать'} • 
                {inventoryItem.item.tradeable ? ' Можно обменять' : ' Нельзя обменять'} • 
                Ценность: {inventoryItem.item.value}
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default InventorySlot;