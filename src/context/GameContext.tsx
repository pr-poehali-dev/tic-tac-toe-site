import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

// Типы для игрока и игры
interface Player {
  id: string;
  username: string;
  symbol: "Х" | "О";
}

interface GameRoom {
  id: string;
  players: Player[];
  currentTurn: string; // id текущего игрока
  status: "waiting" | "playing" | "finished";
  winner: string | null;
  board: Array<string | null>;
  createdAt: number;
}

// Тип для контекста игры
interface GameContextType {
  availableRooms: GameRoom[];
  currentRoom: GameRoom | null;
  joinRoom: (roomId: string) => void;
  createRoom: () => void;
  leaveRoom: () => void;
  makeMove: (index: number) => void;
  isWaiting: boolean;
  isPlaying: boolean;
}

// Создаем контекст
const GameContext = createContext<GameContextType | undefined>(undefined);

// Хук для использования контекста
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame должен использоваться внутри GameProvider");
  }
  return context;
};

// Генератор уникальных ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Провайдер игрового контекста
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  
  // Имитация получения данных с сервера
  useEffect(() => {
    // В реальном приложении здесь был бы запрос к серверу
    const mockRooms: GameRoom[] = [
      {
        id: "room1",
        players: [{
          id: "player1",
          username: "Игрок 1",
          symbol: "Х"
        }],
        currentTurn: "player1",
        status: "waiting",
        winner: null,
        board: Array(9).fill(null),
        createdAt: Date.now() - 60000
      }
    ];
    
    if (availableRooms.length === 0) {
      setAvailableRooms(mockRooms);
    }
    
    // Эмуляция обновления списка комнат каждые 5 секунд
    const interval = setInterval(() => {
      // В реальном приложении здесь был бы запрос к серверу
      // console.log("Обновление списка комнат...");
    }, 5000);
    
    return () => clearInterval(interval);
  }, [availableRooms.length]);
  
  // Создание новой комнаты
  const createRoom = () => {
    if (!user) return;
    
    const newRoom: GameRoom = {
      id: generateId(),
      players: [{
        id: generateId(),
        username: user.username,
        symbol: "Х"
      }],
      currentTurn: generateId(),
      status: "waiting",
      winner: null,
      board: Array(9).fill(null),
      createdAt: Date.now()
    };
    
    setAvailableRooms(prev => [...prev, newRoom]);
    setCurrentRoom(newRoom);
  };
  
  // Присоединение к существующей комнате
  const joinRoom = (roomId: string) => {
    if (!user) return;
    
    const room = availableRooms.find(r => r.id === roomId);
    if (!room || room.status !== "waiting" || room.players.length >= 2) return;
    
    // Добавляем второго игрока
    const updatedRoom = {
      ...room,
      players: [
        ...room.players,
        {
          id: generateId(),
          username: user.username,
          symbol: "О"
        }
      ],
      status: "playing",
    };
    
    setAvailableRooms(prev => 
      prev.map(r => r.id === roomId ? updatedRoom : r)
    );
    
    setCurrentRoom(updatedRoom);
  };
  
  // Выход из комнаты
  const leaveRoom = () => {
    if (!currentRoom || !user) return;
    
    // Если игрок был один, удаляем комнату
    if (currentRoom.players.length === 1) {
      setAvailableRooms(prev => prev.filter(r => r.id !== currentRoom.id));
    } else {
      // Если в комнате был еще игрок, обновляем статус на "waiting"
      const updatedRoom = {
        ...currentRoom,
        players: currentRoom.players.filter(p => p.username !== user.username),
        status: "waiting",
      };
      
      setAvailableRooms(prev => 
        prev.map(r => r.id === currentRoom.id ? updatedRoom : r)
      );
    }
    
    setCurrentRoom(null);
  };
  
  // Совершение хода
  const makeMove = (index: number) => {
    if (!currentRoom || !user || currentRoom.status !== "playing") return;
    
    // Проверяем, что клетка пуста и сейчас ход текущего игрока
    if (currentRoom.board[index] !== null) return;
    
    const currentPlayer = currentRoom.players.find(p => p.username === user.username);
    if (!currentPlayer) return;
    
    // Обновляем доску
    const newBoard = [...currentRoom.board];
    newBoard[index] = currentPlayer.symbol;
    
    // Проверяем на победителя
    const winner = calculateWinner(newBoard);
    const isBoardFull = newBoard.every(cell => cell !== null);
    
    // Определяем следующего игрока
    const nextPlayer = currentRoom.players.find(p => p.id !== currentPlayer.id);
    
    // Обновляем комнату
    const updatedRoom = {
      ...currentRoom,
      board: newBoard,
      currentTurn: nextPlayer ? nextPlayer.id : currentPlayer.id,
      status: winner || isBoardFull ? "finished" : "playing",
      winner: winner ? currentPlayer.username : null,
    };
    
    setAvailableRooms(prev => 
      prev.map(r => r.id === currentRoom.id ? updatedRoom : r)
    );
    
    setCurrentRoom(updatedRoom);
  };
  
  // Проверка на победителя
  const calculateWinner = (squares: Array<string | null>): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    
    return null;
  };
  
  // Статусы для упрощения проверки состояния игры
  const isWaiting = currentRoom?.status === "waiting";
  const isPlaying = currentRoom?.status === "playing";
  
  const value = {
    availableRooms,
    currentRoom,
    joinRoom,
    createRoom,
    leaveRoom,
    makeMove,
    isWaiting,
    isPlaying
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
