import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/context/InventoryContext";
import { ItemSelector } from "@/components/Inventory/ItemSelector";
import { ItemDetails } from "@/components/Inventory/ItemDetails";

const GameLobby: React.FC = () => {
  const { availableRooms, createRoom, joinRoom, spectateRoom } = useGame();
  const { user } = useAuth();
  const { inventory } = useInventory();
  
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showCreateSelector, setShowCreateSelector] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  // Получаем выбранный предмет из инвентаря
  const selectedItem = selectedItemId 
    ? inventory?.items.find(item => item.item.id === selectedItemId)
    : null;
  
  // Проверяем, не участвует ли уже текущий пользователь в какой-то комнате
  const userInGame = availableRooms.some(room => 
    room.players.some(player => player.username === user?.username)
  );
  
  // Обработчик создания новой комнаты
  const handleCreateRoom = () => {
    if (selectedItemId) {
      createRoom(selectedItemId);
      setSelectedItemId(null);
      setShowCreateSelector(false);
    }
  };
  
  // Обработчик присоединения к комнате
  const handleJoinRoom = () => {
    if (selectedItemId && selectedRoomId) {
      joinRoom(selectedRoomId, selectedItemId);
      setSelectedItemId(null);
      setSelectedRoomId(null);
    }
  };
  
  // Проверяем, есть ли предметы в инвентаре
  const hasItems = inventory?.items.length ? inventory.items.length > 0 : false;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        {showCreateSelector ? (
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Выберите предмет для ставки</CardTitle>
            </CardHeader>
            <CardContent>
              {!hasItems && (
                <p className="text-center text-red-500 mb-4">
                  У вас нет предметов в инвентаре. Пополните инвентарь, чтобы создать игру.
                </p>
              )}
              
              {hasItems && (
                <>
                  <ItemSelector 
                    inventoryItems={inventory?.items || []} 
                    onSelectItem={setSelectedItemId}
                    selectedItemId={selectedItemId}
                  />
                  
                  {selectedItem && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Выбранный предмет:</h3>
                      <ItemDetails item={selectedItem.item} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setShowCreateSelector(false);
                setSelectedItemId(null);
              }}>
                Отмена
              </Button>
              <Button 
                onClick={handleCreateRoom} 
                disabled={!selectedItemId || userInGame}
              >
                Создать комнату
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Button 
            onClick={() => setShowCreateSelector(true)} 
            size="lg" 
            className="px-8"
            disabled={userInGame || !hasItems}
          >
            Создать комнату
          </Button>
        )}
        
        {userInGame && (
          <p className="text-sm text-red-500 mt-2">
            Вы уже участвуете в игре. Покиньте текущую комнату, чтобы присоединиться к другой или создать новую.
          </p>
        )}
        
        {!hasItems && !showCreateSelector && (
          <p className="text-sm text-amber-500 mt-2">
            У вас нет предметов в инвентаре. Пополните инвентарь, чтобы создать игру.
          </p>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Доступные комнаты</h2>
        
        {availableRooms.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Пока нет доступных комнат. Создайте новую!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {availableRooms.map(room => (
              <Card key={room.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Комната {room.roomCode}</CardTitle>
                    <Badge variant={room.status === "waiting" ? "outline" : "secondary"}>
                      {room.status === "waiting" ? "Ожидание" : "Идет игра"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Создана: {new Date(room.createdAt).toLocaleString()}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Игроки:</p>
                    <ul className="text-sm">
                      {room.players.map(player => (
                        <li key={player.id} className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted">
                            {player.symbol}
                          </span>
                          <span>{player.username}</span>
                          {player.username === user?.username && (
                            <span className="text-xs text-muted-foreground">(Вы)</span>
                          )}
                        </li>
                      ))}
                      {room.status === "waiting" && room.players.length < 2 && (
                        <li className="text-muted-foreground">Ожидание второго игрока...</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  {user?.role === "admin" && (
                    <Button onClick={() => spectateRoom(room.id)} variant="outline" size="sm">
                      Наблюдать
                    </Button>
                  )}
                  
                  {room.status === "waiting" && room.players.length < 2 && !userInGame && (
                    selectedRoomId === room.id ? (
                      <Card className="w-full">
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">Выберите предмет для ставки</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          {!hasItems ? (
                            <p className="text-xs text-red-500">
                              У вас нет предметов в инвентаре
                            </p>
                          ) : (
                            <ItemSelector 
                              inventoryItems={inventory?.items || []} 
                              onSelectItem={setSelectedItemId}
                              selectedItemId={selectedItemId}
                              compact={true}
                            />
                          )}
                        </CardContent>
                        <CardFooter className="py-2 flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedRoomId(null);
                            setSelectedItemId(null);
                          }}>
                            Отмена
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleJoinRoom}
                            disabled={!selectedItemId}
                          >
                            Присоединиться
                          </Button>
                        </CardFooter>
                      </Card>
                    ) : (
                      <Button 
                        onClick={() => setSelectedRoomId(room.id)} 
                        size="sm"
                        disabled={!hasItems}
                      >
                        Присоединиться
                      </Button>
                    )
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;