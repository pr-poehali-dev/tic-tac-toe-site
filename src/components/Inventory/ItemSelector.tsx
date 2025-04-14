import React from "react";
import { InventoryItem } from "@/types/inventory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ItemSelectorProps {
  inventoryItems: InventoryItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  compact?: boolean;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({ 
  inventoryItems, 
  selectedItemId, 
  onSelectItem,
  compact = false
}) => {
  return (
    <div className="w-full">
      <ScrollArea className={compact ? "h-32" : "h-64"}>
        <div className="grid grid-cols-3 gap-2 p-1">
          {inventoryItems.map((invItem) => (
            <Card 
              key={invItem.item.id} 
              className={`cursor-pointer transition-all border ${
                selectedItemId === invItem.item.id 
                  ? "border-primary ring-2 ring-primary ring-opacity-50" 
                  : "hover:border-gray-400"
              }`}
              onClick={() => onSelectItem(invItem.item.id)}
            >
              <CardContent className={`flex flex-col items-center justify-center ${compact ? "p-2" : "p-4"}`}>
                <div className="w-12 h-12 flex items-center justify-center rounded-md bg-muted mb-2">
                  {invItem.item.icon ? (
                    <img 
                      src={invItem.item.icon} 
                      alt={invItem.item.name} 
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <div className="text-2xl">📦</div>
                  )}
                </div>
                <p className={`font-medium text-center ${compact ? "text-xs" : "text-sm"} line-clamp-1`}>
                  {invItem.item.name}
                </p>
                {invItem.quantity > 1 && (
                  <Badge variant="outline" className="mt-1">
                    x{invItem.quantity}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};