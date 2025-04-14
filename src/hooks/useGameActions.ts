import { useState, useCallback, useEffect } from "react";
import { GameRoom, Player } from "@/types/game";
import { calculateWinner, generateId, generateRoomCode, createInitialBoard } from "@/utils/game";
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
 * Хук для управления игровой логикой
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
      botCheckScheduled: false
    };
    
    // Запланируем проверку добавления бота через 1 минуту
    const updatedRoom = { ...newRoom, botCheckScheduled: true };
    
    setAvailableRooms(prev => [...prev, updatedRoom]);
    setCurrentRoom(updatedRoom);
    setIsSpectating(false);
  }, [user, availableRooms, getItem, removeItem]);

  /**
   * Проверяет комнаты на необходимость добавления бота
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
        hasChanges = true;
        
        // Если текущая комната была обновлена, обновляем и ее
        if (currentRoom && currentRoom.id === room.id) {
          setCurrentRoom(updatedRooms[index]);
        }
      }
    });
    
    if (hasChanges) {
      setAvailableRooms(updatedRooms);
    }
  }, [availableRooms, currentRoom]);
  
  /**
   * Эффект для проверки и автоматического добавления бота в комнаты
   */
  useEffect(() => {
    // Проверяем каждые 5 секунд
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
    
    // Находим комнату по ID
    const room = getRoomById(roomId);
    if (!room) {
      console.warn("Комната не найдена");
      return;
    }
    
    // Проверяем, что комната ждет игроков и в ней есть место
    if (room.status !== "waiting" || room.players.length >= 2) {
      console.warn("Комната недоступна для присоединения");
      return;
    }
    
    // Проверяем, не пытается ли игрок присоединиться дважды к одной комнате
    const isAlreadyInRoom = room.players.some(player => player.username === user.username);
    if (isAlreadyInRoom) {
      console.warn("Вы уже в этой комнате");
      return;
    }
    
    // Проверяем, не состоит ли игрок в другой комнате
    const userInOtherRoom = availableRooms.some(r => 
      r.id !== roomId && r.players.some(player => player.username === user.username)
    );
    
    if (userInOtherRoom) {
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
    if (!user || user.role !== 'admin') return;
    
    const room = getRoomById(roomId);
    if (!room) return;
    
    setCurrentRoom(room);
    setIsSpectating(true);
  }, [getRoomById, user]);

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
    
    // Возвращаем предмет в инвентарь ТОЛЬКО если:
    // 1. Игра еще не завершена (игрок выходит во время игры)
    // ИЛИ
    // 2. Игра завершена И игрок является победителем
    // ИЛИ
    // 3. Игра завершена И это ничья
    if (currentRoom.status !== "finished" || 
        (currentRoom.status === "finished" && 
         (currentRoom.winner === user.username || !currentRoom.winner))) {
      
      console.log("Возвращаем предмет в инвентарь игрока (выход или победа/ничья)");
      const stakeItemId = currentRoom.stakes[player.id];
      
      if (stakeItemId) {
        const item = GameService.getItemById(stakeItemId);
        if (item) {
          addItem(item);
        }
      }
    } else {
      console.log("Предмет игрока сгорает (проигрыш)");
    }
    
    // Если игрок был один или с ботом, удаляем комнату
    const hasOnlyBotOrSinglePlayer = currentRoom.players.length === 1 || 
      (currentRoom.players.length === 2 && currentRoom.players.some(p => p.isBot));
      
    if (hasOnlyBotOrSinglePlayer) {
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
      
      setAvailableRooms(prev => 
        prev.map(r => r.id === currentRoom.id ? updatedRoom : r)
      );
    }
    
    setCurrentRoom(null);
    setIsSpectating(false);
  }, [currentRoom, isSpectating, user, addItem]);

  /**
   * Запускает ход бота с небольшой задержкой
   */
  const triggerBotMove = useCallback((roomToUpdate: GameRoom) => {
    console.log("Запускаем ход бота с задержкой...");
    
    // Находим бота среди игроков
    const botPlayer = roomToUpdate.players.find(p => p.isBot);
    if (!botPlayer) {
      console.log("Бот не найден в комнате");
      return;
    }
    
    setTimeout(() => {
      // Получаем актуальное состояние комнаты
      const updatedRoom = BotService.makeBotMove(roomToUpdate);
      
      // Обновляем состояние только если ход бота был успешным
      if (updatedRoom !== roomToUpdate) {
        console.log("Ход бота выполнен, обновляем состояние");
        
        // Обновляем список доступных комнат
        setAvailableRooms(prev => 
          prev.map(r => r.id === updatedRoom.id ? updatedRoom : r)
        );
        
        // Обновляем текущую комнату если нужно
        setCurrentRoom(prev => {
          if (prev && prev.id === updatedRoom.id) {
            return updatedRoom;
          }
          return prev;
        });
        
        // Если игра закончилась и бот победил, удаляем предмет игрока из инвентаря
        // Это дополнительная проверка на случай, если игрок не выйдет из комнаты
        if (updatedRoom.status === "finished" && updatedRoom.winner === botPlayer.username && user) {
          console.log("Бот победил! Предмет игрока сгорает.");
          // Ничего делать не нужно, т.к. предмет уже удален из инвентаря при создании ставки
        }
      }
    }, 500); // Задержка для естественности
  }, [user]);

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
    
    // Создаем копию доски и делаем ход
    const newBoard = [...currentRoom.board];
    newBoard[index] = currentPlayer.symbol;
    
    // Проверяем условия завершения игры
    const winner = calculateWinner(newBoard);
    const boardFull = newBoard.every(cell => cell !== null);
    
    // Определяем следующего игрока
    const nextPlayer = currentRoom.players.find(p => p.id !== currentPlayer.id);
    
    // Определяем имя победителя (если есть)
    const winnerName = winner ? 
      (winner === currentPlayer.symbol ? currentPlayer.username : (nextPlayer ? nextPlayer.username : null)) : 
      null;
      
    // Формируем обновленную комнату
    let updatedRoom = {
      ...currentRoom,
      board: newBoard,
      currentTurn: nextPlayer ? nextPlayer.id : currentPlayer.id,
      status: winner || boardFull ? "finished" : "playing",
      winner: winnerName,
      lastActivity: Date.now()
    };
    
    // Если игра завершена и пользователь победил, возвращаем его предмет
    if (updatedRoom.status === "finished" && updatedRoom.winner === user.username) {
      console.log("Игрок победил! Возвращаем его предмет и забираем предмет соперника (если это не бот)");
      
      // Возвращаем предмет игрока
      const playerStakeItemId = updatedRoom.stakes[currentPlayer.id];
      if (playerStakeItemId) {
        const playerItem = GameService.getItemById(playerStakeItemId);
        if (playerItem) {
          console.log("Возвращаем предмет игрока:", playerItem.name);
          addItem(playerItem);
        }
      }
      
      // Если противник не бот, забираем его предмет
      if (nextPlayer && !nextPlayer.isBot) {
        const opponentStakeItemId = updatedRoom.stakes[nextPlayer.id];
        if (opponentStakeItemId) {
          const opponentItem = GameService.getItemById(opponentStakeItemId);
          if (opponentItem) {
            console.log("Забираем предмет соперника:", opponentItem.name);
            addItem(opponentItem);
          }
        }
      }
    } 
    // Если игра завершена и бот победил, предмет игрока сгорает (ничего не делаем)
    else if (updatedRoom.status === "finished" && nextPlayer?.isBot && updatedRoom.winner === nextPlayer.username) {
      console.log("Бот победил! Предмет игрока сгорает.");
      // Ничего делать не нужно, т.к. предмет уже удален из инвентаря при создании ставки
    }
    // Ничья - возвращаем предмет игрока
    else if (updatedRoom.status === "finished" && !updatedRoom.winner) {
      console.log("Ничья! Возвращаем предмет игрока");
      const playerStakeItemId = updatedRoom.stakes[currentPlayer.id];
      if (playerStakeItemId) {
        const playerItem = GameService.getItemById(playerStakeItemId);
        if (playerItem) {
          addItem(playerItem);
        }
      }
    }
    
    // Обновляем доступные комнаты
    setAvailableRooms(prev => 
      prev.map(r => r.id === currentRoom.id ? updatedRoom : r)
    );
    
    // Обновляем текущую комнату
    setCurrentRoom(updatedRoom);
    
    // Если следующий ход - бота, и игра продолжается, запускаем его автоматически
    if (updatedRoom.status === "playing" && nextPlayer?.isBot) {
      triggerBotMove(updatedRoom);
    }
  }, [currentRoom, isSpectating, user, addItem, triggerBotMove]);

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