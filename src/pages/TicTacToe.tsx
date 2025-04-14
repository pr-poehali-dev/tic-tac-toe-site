import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import GameLobby from "@/components/TicTacToe/GameLobby";
import GameRoom from "@/components/TicTacToe/GameRoom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Flame } from "lucide-react";

const TicTacToe: React.FC = () => {
  const { user } = useAuth();
  const { currentRoom, availableRooms, setAvailableRooms } = useGame();
  
  // Эффект для очистки завершенных игр
  useEffect(() => {
    // Очищаем завершенные игры каждые 5 минут
    const intervalId = setInterval(() => {
      const now = Date.now();
      const fiveMinutesInMs = 5 * 60 * 1000;
      
      setAvailableRooms(prev => 
        prev.filter(room => {
          // Оставляем только комнаты, которые:
          // 1. Всё еще активны, или
          // 2. Завершились менее 5 минут назад
          return room.status !== "finished" || 
                 (now - room.lastActivity) < fiveMinutesInMs;
        })
      );
    }, 60 * 1000); // Проверяем каждую минуту
    
    return () => clearInterval(intervalId);
  }, [setAvailableRooms]);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Крестики-нолики</h1>
      
      {!user ? (
        <Card>
          <CardHeader>
            <CardTitle>Авторизация требуется</CardTitle>
            <CardDescription>
              Пожалуйста, войдите или зарегистрируйтесь, чтобы играть в крестики-нолики.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Alert className="mb-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="flex items-center gap-2">
              Игра на ставку 
              <Flame className="h-4 w-4 text-red-500" />
            </AlertTitle>
            <AlertDescription>
              В этой игре вы ставите предмет из своего инвентаря. В случае победы вы сохраняете свой предмет, 
              а в случае проигрыша - предмет сгорает и не возвращается в ваш инвентарь!
            </AlertDescription>
          </Alert>
          
          {currentRoom ? <GameRoom /> : <GameLobby />}
        </>
      )}
    </div>
  );
};

export default TicTacToe;