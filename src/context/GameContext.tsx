import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { GameContextType } from "@/types/game";
import { useGameActions } from "@/hooks/useGameActions";
import { GameService } from "@/services/gameService";
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
    setAvailableRooms,
    currentRoom,
    setCurrentRoom,
    isSpectating,
    setIsSpectating,
    createRoom,
    joinRoom,
    leaveRoom,
    makeMove,
    spectateRoom,
    getRoomById
  } = useGameActions(user);
  
  // Загружаем начальные данные при монтировании компонента
  useEffect(() => {
    // Имитация загрузки комнат с сервера
    const fetchInitialRooms = async () => {
      if (availableRooms.length === 0) {
        try {
          const rooms = await GameService.fetchRooms();
          setAvailableRooms(rooms);
        } catch (error) {
          console.error("Ошибка при загрузке комнат:", error);
        }
      }
    };
    
    fetchInitialRooms();
    
    // Имитация периодического обновления списка комнат
    const interval = setInterval(() => {
      // В реальном приложении здесь был бы запрос к серверу для получения актуальных данных
      // fetchRoomsUpdate();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [availableRooms.length, setAvailableRooms]);
  
  // Очищаем завершенные игры каждые 5 минут
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
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
    
    return () => clearInterval(cleanupInterval);
  }, [setAvailableRooms]);
  
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
    isBotsEnabled
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};