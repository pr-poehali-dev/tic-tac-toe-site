import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { GameContextType } from "@/types/game";
import { useGameActions } from "@/hooks/useGameActions";
import { GameService } from "@/services/gameService";

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
    isSpectating,
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
    isSpectating
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};