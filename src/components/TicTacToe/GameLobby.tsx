import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const GameLobby: React.FC = () => {
  const { availableRooms, createRoom, joinRoom } = useGame();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  
  // Фильтруем комнаты в статусе ожидания и где текущий игрок не присутствует
  const waitingRooms = availableRooms.filter(room => 
    room.status === "waiting" && 
    !room.players.some(player => player.username === user?.username)
  );
  
  // Обработчик присоединения по коду
  const handleJoinByCode = () => {
    if (!roomCode.trim()) return;
    
    // Ищем комнату по коду
    const room = availableRooms.find(r => 
      r.roomCode.toLowerCase() === roomCode.trim().toLowerCase() || 
      r.id === roomCode.trim()
    );
    
    if (room && room.status === "waiting") {
      joinRoom(room.id);
    } else {
      // Можно добавить уведомление, что комната не найдена
      alert("Комната не найдена или уже занята");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Лобби игры</h2>
        <p className="text-muted-foreground">Создайте новую игру или присоединитесь к существующей</p>
      </div>
      
      <div className="flex flex-col gap-4">
        <Button onClick={createRoom} size="lg" className="w-full">
          Создать новую игру
        </Button>
        
        <div className="relative mt-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Введите код комнаты..."
                className="pl-8"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
            </div>
            <Button onClick={handleJoinByCode}>
              Присоединиться
            </Button>
          </div>
        </div>
      </div>
      
      {user?.role === 'admin' && (
        <div className="flex justify-center mt-4">
          <Link to="/admin">
            <Button variant="outline">Панель администратора</Button>
          </Link>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Доступные игры</h3>
        
        {waitingRooms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {waitingRooms.map(room => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Комната {room.roomCode}</CardTitle>
                    <Badge variant="outline">Ожидание</Badge>
                  </div>
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
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-muted-foreground">Нет доступных игр. Создайте свою!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;