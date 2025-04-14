import React from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

const GameLobby: React.FC = () => {
  const { availableRooms, createRoom, joinRoom } = useGame();
  const { user } = useAuth();
  
  // Фильтруем комнаты в статусе ожидания и где текущий игрок не присутствует
  const waitingRooms = availableRooms.filter(room => 
    room.status === "waiting" && 
    !room.players.some(player => player.username === user?.username)
  );
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Лобби игры</h2>
        <p className="text-muted-foreground">Создайте новую игру или присоединитесь к существующей</p>
      </div>
      
      <div className="flex justify-center mb-6">
        <Button onClick={createRoom} size="lg" className="w-full md:w-auto">
          Создать игру
        </Button>
      </div>
      
      {waitingRooms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {waitingRooms.map(room => (
            <Card key={room.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>Комната {room.id.substring(0, 6)}</CardTitle>
                <CardDescription>
                  Создана {formatDistanceToNow(room.createdAt, { addSuffix: true, locale: ru })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="mb-1">Игрок: <span className="font-medium">{room.players[0].username}</span></p>
                <p className="text-sm text-muted-foreground">Ожидание второго игрока...</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => joinRoom(room.id)} className="w-full">
                  Присоединиться
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Нет доступных игр. Создайте свою!</p>
        </div>
      )}
    </div>
  );
};

export default GameLobby;