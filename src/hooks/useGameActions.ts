import { useState, useCallback } from "react";
import { GameRoom, Player } from "@/types/game";
import { calculateWinner, generateId, generateRoomCode, createInitialBoard, isBoardFull } from "@/utils/game";
import { GameService } from "@/services/gameService";
import { User } from "@/types/auth"; // Предполагается что тип User определен в types/auth.ts

interface GameActionsReturn {
  availableRooms: GameRoom[];
  setAvailableRooms: React.Dispatch<React.SetStateAction<GameRoom[]>>;
  currentRoom: GameRoom | null;
  setCurrentRoom: React.Dispatch<React.SetStateAction<GameRoom | null>>;
  isSpectating: boolean;
  setIsSpectating: React.Dispatch<React.SetStateAction<boolean>>;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  makeMove: (index: number) => void;
  spectateRoom: (roomId: string) => void;
  getRoomById: (roomId: string) => GameRoom | undefined;
}

/**
 * Хук, предоставляющий функции для управления игрой
 * @param user - Текущий пользователь
 */
export const useGameActions = (user: User | null): GameActionsReturn => {
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isSpectating, setIsSpectating] = useState<boolean>(false);

  /**
   * Находит комнату по ID или коду
   */
  const getRoomById = useCallback((roomId: string): GameRoom | undefined => {
    return availableRooms.find(room => 
      room.id === roomId || room.roomCode === roomId
    );
  }, [availableRooms]);

  /**
   * Создает новую игровую комнату
   */
  const createRoom = useCallback(() => {
    if (!user) return;
    
    // Проверяем, не состоит ли уже пользователь в какой-либо комнате
    const userInRoom = availableRooms.some(room => 
      room.players.some(player => player.username === user.username)
    );
    
    if (userInRoom) {
      console.warn("Вы уже участвуете в другой игре");
      return;
    }
    
    const playerId = generateId();
    const roomId = generateId();
    const roomCode = generateRoomCode();
    
    const player: Player = {
      id: playerId,
      username: user.username,
      symbol: "Х"
    };
    
    const newRoom: GameRoom = {
      id: roomId,
      roomCode: roomCode,
      creatorId: playerId,
      players: [player],
      currentTurn: playerId,
      status: "waiting",
      winner: null,
      board: createInitialBoard(),
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    // В реальном приложении здесь был бы вызов API
    // GameService.createRoom(newRoom).then(...)
    
    setAvailableRooms(prev => [...prev, newRoom]);
    setCurrentRoom(newRoom);
    setIsSpectating(false);
  }, [user, availableRooms]);

  /**
   * Присоединяется к существующей комнате
   */
  const joinRoom = useCallback((roomId: string) => {
    if (!user) return;
    
    // Проверяем, не состоит ли уже пользователь в какой-либо комнате
    const userInRoom = availableRooms.some(room => 
      room.players.some(player => player.username === user.username)
    );
    
    if (userInRoom) {
      console.warn("Вы уже участвуете в другой игре");
      return;
    }
    
    const room = getRoomById(roomId);
    if (!room || room.status !== "waiting" || room.players.length >= 2) return;
    
    // Проверяем, не пытается ли игрок присоединиться дважды к одной комнате
    const isAlreadyInRoom = room.players.some(player => player.username === user.username);
    if (isAlreadyInRoom) {
      console.warn("Вы уже в этой комнате");
      return;
    }
    
    const playerId = generateId();
    
    const newPlayer: Player = {
      id: playerId,
      username: user.username,
      symbol: "О"
    };
    
    const updatedRoom = {
      ...room,
      players: [...room.players, newPlayer],
      status: "playing",
      lastActivity: Date.now()
    };
    
    // В реальном приложении здесь был бы вызов API
    // GameService.updateRoom(updatedRoom).then(...)
    
    setAvailableRooms(prev => 
      prev.map(r => r.id === room.id ? updatedRoom : r)
    );
    
    setCurrentRoom(updatedRoom);
    setIsSpectating(false);
  }, [user, availableRooms, getRoomById]);

  /**
   * Позволяет администратору наблюдать за игрой
   */
  const spectateRoom = useCallback((roomId: string) => {
    const room = getRoomById(roomId);
    if (!room) return;
    
    setCurrentRoom(room);
    setIsSpectating(true);
  }, [getRoomById]);

  /**
   * Выходит из текущей комнаты
   */
  const leaveRoom = useCallback(() => {
    if (!currentRoom) return;

    // Если администратор наблюдает, просто выходим из режима наблюдения
    if (isSpectating && user?.role === 'admin') {
      setCurrentRoom(null);
      setIsSpectating(false);
      return;
    }
    
    if (!user) return;
    
    // Если игрок был один, удаляем комнату
    if (currentRoom.players.length === 1) {
      // В реальном приложении здесь был бы вызов API
      // GameService.deleteRoom(currentRoom.id).then(...)
      
      setAvailableRooms(prev => prev.filter(r => r.id !== currentRoom.id));
    } else {
      // Если в комнате был еще игрок, обновляем статус на "waiting"
      const updatedRoom = {
        ...currentRoom,
        players: currentRoom.players.filter(p => p.username !== user.username),
        status: "waiting",
        lastActivity: Date.now()
      };
      
      // В реальном приложении здесь был бы вызов API
      // GameService.updateRoom(updatedRoom).then(...)
      
      setAvailableRooms(prev => 
        prev.map(r => r.id === currentRoom.id ? updatedRoom : r)
      );
    }
    
    setCurrentRoom(null);
    setIsSpectating(false);
  }, [currentRoom, isSpectating, user]);

  /**
   * Делает ход в игре
   */
  const makeMove = useCallback((index: number) => {
    if (!currentRoom || !user || currentRoom.status !== "playing" || isSpectating) return;
    
    // Проверяем, что клетка пуста
    if (currentRoom.board[index] !== null) return;
    
    const currentPlayer = currentRoom.players.find(p => p.username === user.username);
    if (!currentPlayer) return;
    
    // Проверяем, что сейчас ход текущего игрока
    if (currentRoom.currentTurn !== currentPlayer.id) return;
    
    // Обновляем доску
    const newBoard = [...currentRoom.board];
    newBoard[index] = currentPlayer.symbol;
    
    // Проверяем условия завершения игры
    const winner = calculateWinner(newBoard);
    const boardFull = isBoardFull(newBoard);
    
    // Определяем следующего игрока
    const nextPlayer = currentRoom.players.find(p => p.id !== currentPlayer.id);
    
    // Обновляем комнату
    const updatedRoom = {
      ...currentRoom,
      board: newBoard,
      currentTurn: nextPlayer ? nextPlayer.id : currentPlayer.id,
      status: winner || boardFull ? "finished" : "playing",
      winner: winner ? currentPlayer.username : null,
      lastActivity: Date.now()
    };
    
    // В реальном приложении здесь был бы вызов API
    // GameService.updateRoom(updatedRoom).then(...)
    
    setAvailableRooms(prev => 
      prev.map(r => r.id === currentRoom.id ? updatedRoom : r)
    );
    
    setCurrentRoom(updatedRoom);
  }, [currentRoom, isSpectating, user]);

  return {
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
  };
};