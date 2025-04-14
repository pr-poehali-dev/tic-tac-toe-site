import React from "react";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Sword } from "lucide-react";

interface CharacterEquipmentProps {
  onItemSelect?: (itemId: string) => void;
}

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({ onItemSelect }) => {
  const { inventory } = useInventory();

  if (!inventory) {
    return null;
  }

  // Найти экипированное оружие
  const equippedWeapon = inventory.items.find(
    item => item.item.category === "weapon" && item.equipped
  );

  // Найти экипированную броню
  const equippedArmor = inventory.items.find(
    item => item.item.category === "armor" && item.equipped
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Экипировка</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="border rounded-lg p-3 flex flex-col items-center cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => equippedWeapon && onItemSelect && onItemSelect(equippedWeapon.item.id)}
          >
            <div className="flex items-center mb-2">
              <Sword className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Оружие</span>
            </div>
            {equippedWeapon ? (
              <div className="text-center">
                <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center mb-2">
                  <img 
                    src={equippedWeapon.item.icon} 
                    alt={equippedWeapon.item.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{equippedWeapon.item.name}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs mt-1 ${
                      equippedWeapon.item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      equippedWeapon.item.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                      equippedWeapon.item.rarity === 'legendary' ? 'bg-amber-100 text-amber-800' :
                      equippedWeapon.item.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {equippedWeapon.item.rarity === 'common' ? 'Обычное' : 
                     equippedWeapon.item.rarity === 'uncommon' ? 'Необычное' : 
                     equippedWeapon.item.rarity === 'rare' ? 'Редкое' : 
                     equippedWeapon.item.rarity === 'epic' ? 'Эпическое' : 'Легендарное'}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="h-16 w-16 bg-muted/50 rounded-md flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Не экипировано</span>
              </div>
            )}
          </div>

          <div 
            className="border rounded-lg p-3 flex flex-col items-center cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => equippedArmor && onItemSelect && onItemSelect(equippedArmor.item.id)}
          >
            <div className="flex items-center mb-2">
              <Shield className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Броня</span>
            </div>
            {equippedArmor ? (
              <div className="text-center">
                <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center mb-2">
                  <img 
                    src={equippedArmor.item.icon} 
                    alt={equippedArmor.item.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{equippedArmor.item.name}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs mt-1 ${
                      equippedArmor.item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      equippedArmor.item.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                      equippedArmor.item.rarity === 'legendary' ? 'bg-amber-100 text-amber-800' :
                      equippedArmor.item.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {equippedArmor.item.rarity === 'common' ? 'Обычная' : 
                     equippedArmor.item.rarity === 'uncommon' ? 'Необычная' : 
                     equippedArmor.item.rarity === 'rare' ? 'Редкая' : 
                     equippedArmor.item.rarity === 'epic' ? 'Эпическая' : 'Легендарная'}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="h-16 w-16 bg-muted/50 rounded-md flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Не экипировано</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterEquipment;