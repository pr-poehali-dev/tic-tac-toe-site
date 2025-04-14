import { useState, useCallback, useEffect } from "react";
import { GameRoom, Player } from "@/types/game";
import { calculateWinner, generateId, generateRoomCode, createInitialBoard, isBoardFull } from "@/utils/game";
import { GameService } from "@/services/gameService";
import { BotService } from "@/services/botService";
import { User } from "@/types/auth";
import { useInventory } from "@/context/InventoryContext";

interface GameActionsReturn {
  availableRooms: GameRoom[];
  setAvailableRooms: React.Dispatch<React.SetStateAction<GameRoom[]>>;
  currentRoom: GameRoom | null;
  setCurrentRoom: React.Dispatch<React.SetStateAction<GameRoom | null>>;
  isSpectating: boolean;
  setIsSpectating: React.Dispatch<React.SetStateAction<boolean>>;
  createRoom: (stakeItemId: string) => void;
  joinRoom: (roomId: string, stakeItemId: string) => void;
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
  const { removeItem, addItem, getItem } = useInventory();

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
  const createRoom = useCallback((stakeItemId: string) => {
    if (!user) return;
    
    // Проверяем, не состоит ли уже пользователь в какой-либо комнате
    const userInRoom = availableRooms.some(room => 
      room.players.some(player => player.username === user.username)
    );
    
    if (userInRoom) {
      console.warn("Вы уже участвуете в другой игре");
      return;
    }
    
    // Проверяем, существует ли предмет в инвентаре
    const stakeItem = getItem(stakeItemId);
    if (!stakeItem) {
      console.warn("Выбранный предмет не найден в инвентаре");
      return;
    }
    
    // Удаляем предмет из инвентаря игрока
    if (!removeItem(stakeItemId, 1)) {
      console.warn("Не удалось удалить предмет из инвентаря");
      return;
    }
    
    const playerId = generateId();
    const roomId = generateId();
    const roomCode = generateRoomCode();
    
    const player: Player = {
      id: playerId,
      username: user.username,
      symbol: "Х",
      stakeItemId
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
      lastActivity: Date.now(),
      stakes: {
        [playerId]: stakeItemId
      },
      botCheckScheduled: false // Флаг для отслеживания, запланирована ли проверка на добавление бота
    };
    
    // В реальном приложении здесь был бы вызов API
    // GameService.createRoom(newRoom).then(...)
    
    // Запланируем проверку добавления бота через 1 минуту
    const updatedRoom = { ...newRoom, botCheckScheduled: true };
    
    setAvailableRooms(prev => [...prev, updatedRoom]);
    setCurrentRoom(updatedRoom);
    setIsSpectating(false);
  }, [user, availableRooms, getItem, removeItem]);

  /**
   * Проверяет все комнаты, ожидающие подключения, 
   * и добавляет бота, если ожидание длится больше минуты
   */
  const checkRoomsForBot = useCallback(() => {
    const updatedRooms = [...availableRooms];
    let hasChanges = false;
    
    updatedRooms.forEach((room, index) => {
      // Если комната ожидает игрока и прошла минута
      if (BotService.shouldAddBot(room)) {
        console.log(`Добавляем бота в комнату ${room.id}`);
        
        // Обновляем комнату, добавляя бота
        updatedRooms[index] = BotService.addBotToRoom(room);
        
        // Если текущая комната была обновлена, обновляем и ее
        if (currentRoom && currentRoom.id === room.id) {
          setCurrentRoom(updatedRooms[index]);
        }
        
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setAvailableRooms(updatedRooms);
    }
  }, [availableRooms, currentRoom]);
  
  /**
   * Эффект для проверки и автоматического добавления бота в комнаты, 
   * которые ожидают игрока слишком долго
   */
  useEffect(() => {
    // Проверяем каждые 5 секунд, не нужно ли добавить бота
    const botCheckInterval = setInterval(() => {
      checkRoomsForBot();
    }, 5000);
    
    return () => clearInterval(botCheckInterval);
  }, [checkRoomsForBot]);

  /**
   * Присоединяется к существующей комнате
   */
  const joinRoom = useCallback((roomId: string, stakeItemId: string) => {
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
    
    // Проверяем, существует ли предмет в инвентаре
    const stakeItem = getItem(stakeItemId);
    if (!stakeItem) {
      console.warn("Выбранный предмет не найден в инвентаре");
      return;
    }
    
    // Удаляем предмет из инвентаря игрока
    if (!removeItem(stakeItemId, 1)) {
      console.warn("Не удалось удалить предмет из инвентаря");
      return;
    }
    
    const playerId = generateId();
    
    const newPlayer: Player = {
      id: playerId,
      username: user.username,
      symbol: "О",
      stakeItemId
    };
    
    const updatedRoom = {
      ...room,
      players: [...room.players, newPlayer],
      status: "playing",
      lastActivity: Date.now(),
      stakes: {
        ...room.stakes,
        [playerId]: stakeItemId
      }
    };
    
    // В реальном приложении здесь был бы вызов API
    // GameService.updateRoom(updatedRoom).then(...)
    
    setAvailableRooms(prev => 
      prev.map(r => r.id === room.id ? updatedRoom : r)
    );
    
    setCurrentRoom(updatedRoom);
    setIsSpectating(false);
  }, [user, availableRooms, getRoomById, getItem, removeItem]);

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
    
    // Находим игрока
    const player = currentRoom.players.find(p => p.username === user.username);
    if (!player) return;
    
    // Возвращаем предмет в инвентарь, если игра еще не завершена
    if (currentRoom.status !== "finished" && player.stakeItemId) {
      const itemId = player.stakeItemId;
      // Получаем предмет из stakes комнаты
      const stakeItemId = currentRoom.stakes[player.id];
      if (stakeItemId) {
        // Получаем информацию о предмете из GameService
        const item = GameService.getItemById(stakeItemId);
        if (item) {
          addItem(item);
        }
      }
    }
    
    // Если игрок был один или с ботом, удаляем комнату
    const hasOnlyBotOrSinglePlayer = currentRoom.players.length === 1 || 
      (currentRoom.players.length === 2 && currentRoom.players.some(p => p.isBot));
      
    if (hasOnlyBotOrSinglePlayer) {
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
      
      // Удаляем ставку игрока из комнаты
      if (player && player.id in updatedRoom.stakes) {
        const newStakes = {...updatedRoom.stakes};
        delete newStakes[player.id];
        updatedRoom.stakes = newStakes;
      }
      
      // В реальном приложении здесь был бы вызов API
      // GameService.updateRoom(updatedRoom).then(...)
      
      setAvailableRooms(prev => 
        prev.map(r => r.id === currentRoom.id ? updatedRoom : r)
      );
    }
    
    setCurrentRoom(null);
    setIsSpectating(false);
  }, [currentRoom, isSpectating, user, addItem]);

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
    
    // Формируем обновленную комнату
    let updatedRoom = {
      ...currentRoom,
      board: newBoard,
      currentTurn: nextPlayer ? nextPlayer.id : currentPlayer.id,
      status: winner || boardFull ? "finished" : "playing",
      winner: winner ? (winner === currentPlayer.symbol ? currentPlayer.username : (nextPlayer ? nextPlayer.username : null)) : null,
      lastActivity: Date.now()
    };
    
    // Если есть победитель, передаем все ставки победителю
    if (winner && updatedRoom.winner && updatedRoom.winner === user.username) {
      // Получаем все предметы из ставок и добавляем их победителю
      Object.values(updatedRoom.stakes).forEach(itemId => {
        const item = GameService.getItemById(itemId);
        if (item) {
          addItem(item);
        }
      });
    }
    
    // Обновляем доступные комнаты
    setAvailableRooms(prev => 
      prev.map(r => r.id === currentRoom.id ? updatedRoom : r)
    );
    
    // Обновляем текущую комнату
    setCurrentRoom(updatedRoom);
    
    // Если следующий ход - бота, запускаем его автоматически с небольшой задержкой
    if (updatedRoom.status === "playing" && nextPlayer?.isBot) {
      setTimeout(() => {
        // Проверяем, что комната всё ещё существует и ход бота
        const currentRoomState = getRoomById(updatedRoom.id);
        if (currentRoomState && currentRoomState.status === "playing" && 
            currentRoomState.currentTurn === nextPlayer.id) {
          // Делаем ход ботом
          const botUpdatedRoom = BotService.makeBotMove(currentRoomState);
          
          // Обновляем список комнат
          setAvailableRooms(prev => 
            prev.map(r => r.id === botUpdatedRoom.id ? botUpdatedRoom : r)
          );
          
          // Если это наша текущая комната, обновляем состояние
          if (currentRoom && currentRoom.id === botUpdatedRoom.id) {
            setCurrentRoom(botUpdatedRoom);
            
            // Если бот выиграл, обрабатываем ставки
            if (botUpdatedRoom.status === "finished" && botUpdatedRoom.winner === BotService.BOT_NAME) {
              // Бот забирает все предметы :)
              console.log("Бот выиграл и забрал все ставки!");
            }
          }
        }
      }, 1000); // Задержка 1 секунда, чтобы игрок успел увидеть свой ход
    }
    
  }, [currentRoom, isSpectating, user, addItem, getRoomById]);

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