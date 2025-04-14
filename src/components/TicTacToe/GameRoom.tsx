import React from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import Board from "./Board";

const GameRoom: React.FC = () => {
  const { currentRoom, leaveRoom, makeMove } = useGame();
  const { user } = useAuth();
  
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
      gameStatus = isMyTurn ? "Ваш ход" : "Ход соперника";
    }
  } else if (currentRoom.status === "finished") {
    if (currentRoom.winner) {
      gameStatus = currentRoom.winner === user?.username 
        ? "Вы победили!" 
        : `Победитель: ${currentRoom.winner}`;
    } else {
      gameStatus = "Ничья!";
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Игровая комната</CardTitle>
          <CardDescription>
            ID: {currentRoom.id.substring(0, 6)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-4">
          <div className="flex justify-between mb-4">
            <div>
              <p className="font-medium">{currentPlayer?.username} ({currentPlayer?.symbol})</p>
              {currentRoom.status === "playing" && (
                <p className="text-sm text-muted-foreground">
                  {currentRoom.currentTurn === currentPlayer?.id ? "Ваш ход" : ""}
                </p>
              )}
            </div>
            
            {opponentPlayer && (
              <div className="text-right">
                <p className="font-medium">{opponentPlayer.username} ({opponentPlayer.symbol})</p>
                {currentRoom.status === "playing" && (
                  <p className="text-sm text-muted-foreground">
                    {currentRoom.currentTurn === opponentPlayer.id ? "Ходит" : ""}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="text-center mb-4">
            <p className="text-xl font-bold">{gameStatus}</p>
          </div>
          
          <div className="flex justify-center mb-4">
            <Board 
              squares={currentRoom.board} 
              onClick={(i) => {
                // Проверяем, можно ли сделать ход
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
        </CardContent>
        
        <CardFooter>
          <Button onClick={leaveRoom} className="w-full" variant="outline">
            {currentRoom.status === "finished" ? "Вернуться в лобби" : "Покинуть игру"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameRoom;