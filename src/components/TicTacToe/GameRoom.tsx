import React from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Copy, Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Board from "./Board";

const GameRoom: React.FC = () => {
  const { currentRoom, leaveRoom, makeMove, isSpectating } = useGame();
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!currentRoom) return null;
  
  // Находим текущего игрока
  const currentPlayer = currentRoom.players.find(p => p.username === user?.username);
  const opponentPlayer = currentRoom.players.find(p => p.username !== user?.username);
  
  // Определяем статус игры
  let gameStatus = "";
  
  if (currentRoom.status === "waiting") {
    gameStatus = "Ожидание второго игрока...";
  } else if (currentRoom.status === "playing") {
    if (currentRoom.winner) {
      gameStatus = `Победитель: ${currentRoom.winner}`;
    } else if (currentRoom.board.every(cell => cell !== null)) {
      gameStatus = "Ничья!";
    } else {
      const isMyTurn = currentRoom.players.some(p => 
        p.username === user?.username && p.id === currentRoom.currentTurn
      );
      
      if (isSpectating) {
        const currentPlayerTurn = currentRoom.players.find(p => p.id === currentRoom.currentTurn);
        gameStatus = `Ход игрока: ${currentPlayerTurn?.username || "Неизвестно"} (${currentPlayerTurn?.symbol || "?"})`;
      } else {
        gameStatus = isMyTurn ? "Ваш ход" : "Ход соперника";
      }
    }
  } else if (currentRoom.status === "finished") {
    if (currentRoom.winner) {
      if (isSpectating) {
        gameStatus = `Победитель: ${currentRoom.winner}`;
      } else {
        gameStatus = currentRoom.winner === user?.username 
          ? "Вы победили!" 
          : `Победитель: ${currentRoom.winner}`;
      }
    } else {
      gameStatus = "Ничья!";
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(currentRoom.roomCode);
    toast({
      title: "Код скопирован",
      description: "Код комнаты скопирован в буфер обмена"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Игровая комната</CardTitle>
              <CardDescription>
                Создана {formatDistanceToNow(currentRoom.createdAt, { addSuffix: true, locale: ru })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-muted p-2 rounded">
              <span className="text-sm font-medium">Код: {currentRoom.roomCode}</span>
              <Button variant="ghost" size="icon" onClick={copyRoomCode} className="h-6 w-6">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          {isSpectating && (
            <div className="bg-yellow-100 dark:bg-yellow-950 p-2 rounded mb-4 text-sm">
              <p className="font-medium">Режим наблюдения (только для администраторов)</p>
            </div>
          )}
          
          <div className="flex justify-between mb-4">
            <div>
              {currentRoom.players[0] && (
                <div className="flex items-center">
                  <p className="font-medium">{currentRoom.players[0].username} ({currentRoom.players[0].symbol})</p>
                  {currentRoom.players[0].isBot && (
                    <Bot className="ml-1 h-4 w-4 text-blue-500" title="Бот" />
                  )}
                  {currentRoom.status === "playing" && (
                    <p className="text-sm text-muted-foreground ml-2">
                      {currentRoom.currentTurn === currentRoom.players[0].id ? "Сейчас ходит" : ""}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-right">
              {currentRoom.players[1] ? (
                <div className="flex items-center justify-end">
                  {currentRoom.status === "playing" && (
                    <p className="text-sm text-muted-foreground mr-2">
                      {currentRoom.currentTurn === currentRoom.players[1].id ? "Сейчас ходит" : ""}
                    </p>
                  )}
                  <p className="font-medium">{currentRoom.players[1].username} ({currentRoom.players[1].symbol})</p>
                  {currentRoom.players[1].isBot && (
                    <Bot className="ml-1 h-4 w-4 text-blue-500" title="Бот" />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-end">
                  <p className="text-sm text-muted-foreground">Ожидание второго игрока...</p>
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full">
                    Бот подключится через 1 минуту
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-xl font-bold">{gameStatus}</p>
          </div>
          
          <div className="flex justify-center mb-4">
            <Board 
              squares={currentRoom.board} 
              onClick={(i) => {
                // Проверяем, можно ли сделать ход
                if (isSpectating) return; // В режиме наблюдения ходить нельзя
                
                const canMove = 
                  currentRoom.status === "playing" && 
                  currentRoom.currentTurn === currentPlayer?.id &&
                  currentRoom.board[i] === null;
                
                if (canMove) {
                  makeMove(i);
                }
              }} 
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>ID комнаты: {currentRoom.id}</p>
            <p>Последняя активность: {formatDistanceToNow(currentRoom.lastActivity, { addSuffix: true, locale: ru })}</p>
            {currentRoom.players.some(p => p.isBot) && (
              <p className="mt-2 text-blue-500 flex items-center">
                <Bot className="mr-1 h-4 w-4" /> 
                В этой комнате играет бот
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button onClick={leaveRoom} className="w-full" variant="outline">
            {isSpectating ? "Вернуться к списку комнат" : (currentRoom.status === "finished" ? "Вернуться в лобби" : "Покинуть игру")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameRoom;