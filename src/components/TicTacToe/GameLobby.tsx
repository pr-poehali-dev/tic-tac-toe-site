import React from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const GameLobby: React.FC = () => {
  const { availableRooms, createRoom, joinRoom, spectateRoom } = useGame();
  const { user } = useAuth();
  
  // Проверяем, не участвует ли уже текущий пользователь в какой-то комнате
  const userInGame = availableRooms.some(room => 
    room.players.some(player => player.username === user?.username)
  );
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Button 
          onClick={createRoom} 
          size="lg" 
          className="px-8"
          disabled={userInGame}
        >
          Создать комнату
        </Button>
        {userInGame && (
          <p className="text-sm text-red-500 mt-2">
            Вы уже участвуете в игре. Покиньте текущую комнату, чтобы присоединиться к другой или создать новую.
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
                  
                  {room.status === "waiting" && room.players.length < 2 && (
                    <Button 
                      onClick={() => joinRoom(room.id)} 
                      size="sm"
                      disabled={userInGame || room.players.some(p => p.username === user?.username)}
                    >
                      Присоединиться
                    </Button>
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