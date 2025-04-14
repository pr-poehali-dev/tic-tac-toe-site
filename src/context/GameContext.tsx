import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { GameContextType } from "@/types/game";
import { useGameActions } from "@/hooks/useGameActions";
import { BotService } from "@/services/botService";

// Создаем контекст
const GameContext = createContext<GameContextType | undefined>(undefined);

/**
 * Хук для использования игрового контекста
 * @returns Игровой контекст
 */
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame должен использоваться внутри GameProvider");
  }
  return context;
};

/**
 * Провайдер игрового контекста
 */
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Используем хук с игровой логикой
  const {
    availableRooms,
    currentRoom,
    joinRoom,
    createRoom,
    leaveRoom,
    makeMove,
    getRoomById,
    spectateRoom,
    refreshRooms
  } = useGameActions(user);
  
  // Очищаем завершенные игры каждые 5 минут
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      await refreshRooms(); // Сначала обновляем, чтобы получить актуальные данные
    }, 60 * 1000); // Проверяем каждую минуту
    
    return () => clearInterval(cleanupInterval);
  }, [refreshRooms]);
  
  // Функция для включения/выключения ботов
  const toggleBots = (enabled: boolean) => {
    if (enabled) {
      BotService.enableBots();
    } else {
      BotService.disableBots();
    }
  };
  
  // Функция для проверки, включены ли боты
  const isBotsEnabled = () => {
    return BotService.isBotsEnabled();
  };
  
  // Статусы для упрощения проверки состояния игры
  const isWaiting = currentRoom?.status === "waiting";
  const isPlaying = currentRoom?.status === "playing";
  const isSpectating = currentRoom !== null && !currentRoom.players.some(p => p.username === user?.username);
  
  // Формируем значение контекста
  const contextValue: GameContextType = {
    availableRooms,
    currentRoom,
    joinRoom,
    createRoom,
    leaveRoom,
    makeMove,
    getRoomById,
    spectateRoom,
    isWaiting,
    isPlaying,
    isSpectating,
    toggleBots,
    isBotsEnabled,
    refreshRooms
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};