import React, { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import Board from "./Board";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { GameService } from "@/services/gameService";
import { Item } from "@/types/inventory";

const GameInfoItem: React.FC<{ label: string; value: string | number | JSX.Element }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const ItemDisplay: React.FC<{ itemId: string }> = ({ itemId }) => {
  const item = GameService.getItemById(itemId) as Item | null;
  
  if (!item) return <span>Неизвестный предмет</span>;
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 flex items-center justify-center bg-muted rounded-md">
        {item.icon ? (
          <img src={item.icon} alt={item.name} className="w-5 h-5 object-contain" />
        ) : (
          <span>📦</span>
        )}
      </div>
      <span className="text-sm font-medium">{item.name}</span>
    </div>
  );
};

const Game: React.FC = () => {
  const { currentRoom, leaveRoom, makeMove, isSpectating } = useGame();
  const { user } = useAuth();
  
  useEffect(() => {
    // Для реальной игры здесь может быть логика подключения к сокетам и т.д.
    return () => {
      // Отключение от сокетов при размонтировании компонента
    };
  }, []);
  
  if (!currentRoom) {
    return null;
  }
  
  const currentPlayer = currentRoom.players.find(player => player.username === user?.username);
  const opponent = currentRoom.players.find(player => player.username !== user?.username);
  
  const isPlayerTurn = currentPlayer && currentRoom.currentTurn === currentPlayer.id;
  const isGameFinished = currentRoom.status === "finished";
  const isWinner = isGameFinished && currentRoom.winner === user?.username;
  const isDraw = isGameFinished && !currentRoom.winner;
  
  // Функция для отображения ставок
  const renderStakes = () => {
    return (
      <div className="space-y-2 mt-4">
        <p className="text-sm font-medium">Ставки:</p>
        {currentRoom.players.map(player => (
          <div key={player.id} className="flex items-center justify-between">
            <span>{player.username}</span>
            {player.stakeItemId && currentRoom.stakes[player.id] ? (
              <ItemDisplay itemId={currentRoom.stakes[player.id]} />
            ) : (
              <span className="text-sm text-muted-foreground">Нет ставки</span>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Комната {currentRoom.roomCode}</span>
          {isSpectating && <span className="text-sm badge">Режим наблюдателя</span>}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {currentRoom.status === "waiting" ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-medium mb-2">Ожидание второго игрока</h3>
            <p className="text-muted-foreground">
              Поделитесь кодом комнаты {currentRoom.roomCode} с другом, чтобы начать игру
            </p>
            {renderStakes()}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {currentRoom.players.map(player => (
                <GameInfoItem 
                  key={player.id}
                  label="Игрок"
                  value={
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted">
                        {player.symbol}
                      </span>
                      <span>
                        {player.username}
                        {player.username === user?.username && " (Вы)"}
                      </span>
                    </div>
                  }
                />
              ))}
            </div>
            
            {!isGameFinished && (
              <GameInfoItem 
                label="Текущий ход"
                value={
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-500"></span>
                    <span>
                      {currentRoom.players.find(p => p.id === currentRoom.currentTurn)?.username}
                      {currentRoom.currentTurn === currentPlayer?.id && " (Ваш ход)"}
                    </span>
                  </div>
                }
              />
            )}
            
            {isGameFinished && (
              <div className="my-4 p-3 rounded-md bg-muted">
                {isWinner && (
                  <p className="font-bold text-green-600 text-center">Вы выиграли! Ставки переданы в ваш инвентарь.</p>
                )}
                {isGameFinished && currentRoom.winner && !isWinner && (
                  <p className="font-bold text-red-600 text-center">Вы проиграли. Ваша ставка утеряна.</p>
                )}
                {isDraw && (
                  <p className="font-bold text-amber-600 text-center">Ничья! Ставки возвращены игрокам.</p>
                )}
              </div>
            )}
            
            <Separator className="my-4" />
            
            <Board 
              squares={currentRoom.board} 
              onClick={(index) => !isSpectating && makeMove(index)}
              disabled={!isPlayerTurn || isGameFinished || isSpectating}
              winnerLine={[]}
            />
            
            {renderStakes()}
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={leaveRoom} 
          className="w-full"
          variant={isGameFinished ? "default" : "outline"}
        >
          {isGameFinished ? "Вернуться в лобби" : "Покинуть игру"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Game;