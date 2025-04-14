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
  roomCode: string; // Уникальный код комнаты
  creatorId: string; // ID создателя комнаты
  players: Player[];
  currentTurn: string; // id текущего игрока
  status: "waiting" | "playing" | "finished";
  winner: string | null;
  board: Array<string | null>;
  createdAt: number;
  lastActivity: number;
}

// Тип для контекста игры
interface GameContextType {
  availableRooms: GameRoom[];
  currentRoom: GameRoom | null;
  joinRoom: (roomId: string) => void;
  createRoom: () => void;
  leaveRoom: () => void;
  makeMove: (index: number) => void;
  getRoomById: (roomId: string) => GameRoom | undefined;
  spectateRoom: (roomId: string) => void;
  isWaiting: boolean;
  isPlaying: boolean;
  isSpectating: boolean;
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

// Генератор кода комнаты (6 символов)
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Без схожих символов I,1,O,0
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Провайдер игрового контекста
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isSpectating, setIsSpectating] = useState<boolean>(false);
  
  // Имитация получения данных с сервера
  useEffect(() => {
    // В реальном приложении здесь был бы запрос к серверу
    const mockRooms: GameRoom[] = [
      {
        id: "room1",
        roomCode: "ABC123",
        creatorId: "player1",
        players: [{
          id: "player1",
          username: "Игрок 1",
          symbol: "Х"
        }],
        currentTurn: "player1",
        status: "waiting",
        winner: null,
        board: Array(9).fill(null),
        createdAt: Date.now() - 60000,
        lastActivity: Date.now() - 50000
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
  
  // Получение комнаты по ID
  const getRoomById = (roomId: string) => {
    return availableRooms.find(room => room.id === roomId || room.roomCode === roomId);
  };
  
  // Создание новой комнаты
  const createRoom = () => {
    if (!user) return;
    
    const playerId = generateId();
    const roomId = generateId();
    const roomCode = generateRoomCode();
    
    const newRoom: GameRoom = {
      id: roomId,
      roomCode: roomCode,
      creatorId: playerId,
      players: [{
        id: playerId,
        username: user.username,
        symbol: "Х"
      }],
      currentTurn: playerId,
      status: "waiting",
      winner: null,
      board: Array(9).fill(null),
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    setAvailableRooms(prev => [...prev, newRoom]);
    setCurrentRoom(newRoom);
    setIsSpectating(false);
  };
  
  // Присоединение к существующей комнате
  const joinRoom = (roomId: string) => {
    if (!user) return;
    
    const room = getRoomById(roomId);
    if (!room || room.status !== "waiting" || room.players.length >= 2) return;
    
    const playerId = generateId();
    
    // Добавляем второго игрока
    const updatedRoom = {
      ...room,
      players: [
        ...room.players,
        {
          id: playerId,
          username: user.username,
          symbol: "О"
        }
      ],
      status: "playing",
      lastActivity: Date.now()
    };
    
    setAvailableRooms(prev => 
      prev.map(r => r.id === room.id ? updatedRoom : r)
    );
    
    setCurrentRoom(updatedRoom);
    setIsSpectating(false);
  };
  
  // Наблюдение за комнатой (для администратора)
  const spectateRoom = (roomId: string) => {
    const room = getRoomById(roomId);
    if (!room) return;
    
    setCurrentRoom(room);
    setIsSpectating(true);
  };
  
  // Выход из комнаты
  const leaveRoom = () => {
    if (!currentRoom || (isSpectating && user?.role === 'admin')) {
      // Если администратор наблюдает за игрой, просто выходим из режима наблюдения
      setCurrentRoom(null);
      setIsSpectating(false);
      return;
    }
    
    if (!user) return;
    
    // Если игрок был один, удаляем комнату
    if (currentRoom.players.length === 1) {
      setAvailableRooms(prev => prev.filter(r => r.id !== currentRoom.id));
    } else {
      // Если в комнате был еще игрок, обновляем статус на "waiting"
      const updatedRoom = {
        ...currentRoom,
        players: currentRoom.players.filter(p => p.username !== user.username),
        status: "waiting",
        lastActivity: Date.now()
      };
      
      setAvailableRooms(prev => 
        prev.map(r => r.id === currentRoom.id ? updatedRoom : r)
      );
    }
    
    setCurrentRoom(null);
    setIsSpectating(false);
  };
  
  // Совершение хода
  const makeMove = (index: number) => {
    if (!currentRoom || !user || currentRoom.status !== "playing" || isSpectating) return;
    
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
      lastActivity: Date.now()
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
    getRoomById,
    spectateRoom,
    isWaiting,
    isPlaying,
    isSpectating
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
