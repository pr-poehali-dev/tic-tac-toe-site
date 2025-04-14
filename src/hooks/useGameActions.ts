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
  refreshRooms: () => Promise<void>;
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
   * Обновляет список доступных комнат
   */
  const refreshRooms = useCallback(async () => {
    try {
      const rooms = await GameService.fetchRooms();
      setAvailableRooms(rooms);
      
      // Если у нас есть текущая комната, нужно обновить и её
      if (currentRoom) {
        const updatedCurrentRoom = rooms.find(room => room.id === currentRoom.id);
        if (updatedCurrentRoom) {
          setCurrentRoom(updatedCurrentRoom);
        } else if (currentRoom && !isSpectating) {
          // Если комната исчезла, но мы не в режиме наблюдения, 
          // возможно, её удалили - проверим, есть ли мы в другой комнате
          const userRoom = rooms.find(room => 
            room.players.some(player => player.username === user?.username)
          );
          
          if (userRoom) {
            setCurrentRoom(userRoom);
          } else {
            // Если нас нет ни в одной комнате, сбросим текущую комнату
            setCurrentRoom(null);
          }
        }
      } else if (user && !isSpectating) {
        // Если у нас нет выбранной комнаты, но пользователь авторизован,
        // проверим, есть ли он в какой-то комнате
        const userRoom = rooms.find(room => 
          room.players.some(player => player.username === user.username)
        );
        
        if (userRoom) {
          setCurrentRoom(userRoom);
        }
      }
    } catch (error) {
      console.error("Ошибка при обновлении комнат:", error);
    }
  }, [currentRoom, user, isSpectating]);

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
  const createRoom = useCallback(async (stakeItemId: string) => {
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
    
    // Сохраняем комнату на "сервере"
    try {
      await GameService.saveRoom(updatedRoom);
      
      // Обновляем сначала комнату локально, а потом обновим список
      setCurrentRoom(updatedRoom);
      setIsSpectating(false);
      
      await refreshRooms(); // Обновляем список комнат
    } catch (error) {
      console.error("Ошибка при создании комнаты:", error);
      // Возвращаем предмет в инвентарь при ошибке
      if (stakeItem) {
        addItem(stakeItem.item);
      }
    }
  }, [user, availableRooms, getItem, removeItem, addItem, refreshRooms]);

  /**
   * Проверяет комнаты на необходимость добавления бота
   */
  const checkRoomsForBot = useCallback(async () => {
    const updatedRooms = [...availableRooms];
    let hasChanges = false;
    
    for (let i = 0; i < updatedRooms.length; i++) {
      const room = updatedRooms[i];
      
      // Если комната ожидает игрока и прошла минута
      if (BotService.shouldAddBot(room)) {
        console.log(`Добавляем бота в комнату ${room.id}`);
        
        // Обновляем комнату, добавляя бота
        updatedRooms[i] = BotService.addBotToRoom(room);
        hasChanges = true;
        
        // Сохраняем изменённую комнату на "сервере"
        await GameService.saveRoom(updatedRooms[i]);
      }
    }
    
    if (hasChanges) {
      await refreshRooms(); // Обновляем список комнат из "сервера"
    }
  }, [availableRooms, refreshRooms]);
  
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
  const joinRoom = useCallback(async (roomId: string, stakeItemId: string) => {
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
    
    try {
      // Сохраняем обновленную комнату на "сервере"
      await GameService.saveRoom(updatedRoom);
      
      // Обновляем сначала комнату локально, а потом обновим список
      setCurrentRoom(updatedRoom);
      setIsSpectating(false);
      
      await refreshRooms(); // Обновляем список комнат
    } catch (error) {
      console.error("Ошибка при присоединении к комнате:", error);
      // Возвращаем предмет в инвентарь при ошибке
      if (stakeItem) {
        addItem(stakeItem.item);
      }
    }
  }, [user, availableRooms, getRoomById, getItem, removeItem, addItem, refreshRooms]);

  /**
   * Позволяет администратору наблюдать за игрой
   */
  const spectateRoom = useCallback(async (roomId: string) => {
    if (!user || user.role !== 'admin') return;
    
    // Обновляем список комнат перед наблюдением
    await refreshRooms();
    
    const room = getRoomById(roomId);
    if (!room) return;
    
    setCurrentRoom(room);
    setIsSpectating(true);
  }, [getRoomById, user, refreshRooms]);

  /**
   * Выходит из текущей комнаты
   */
  const leaveRoom = useCallback(async () => {
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
    
    try {
      // Сначала сбрасываем текущую комнату, чтобы пользователь не видел возможные ошибки
      setCurrentRoom(null);
      setIsSpectating(false);
      
      if (hasOnlyBotOrSinglePlayer) {
        // Удаляем комнату с "сервера"
        await GameService.deleteRoom(currentRoom.id);
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
        
        // Сохраняем обновленную комнату на "сервере"
        await GameService.saveRoom(updatedRoom);
      }
      
      // Обновляем список комнат
      await refreshRooms();
    } catch (error) {
      console.error("Ошибка при выходе из комнаты:", error);
    }
  }, [currentRoom, isSpectating, user, addItem, refreshRooms]);

  /**
   * Запускает ход бота с небольшой задержкой
   */
  const triggerBotMove = useCallback(async (roomToUpdate: GameRoom) => {
    console.log("Запускаем ход бота с задержкой...");
    
    // Находим бота среди игроков
    const botPlayer = roomToUpdate.players.find(p => p.isBot);
    if (!botPlayer) {
      console.log("Бот не найден в комнате");
      return;
    }
    
    setTimeout(async () => {
      try {
        // Получаем актуальное состояние комнаты с "сервера"
        const rooms = await GameService.fetchRooms();
        const freshRoom = rooms.find(r => r.id === roomToUpdate.id);
        
        if (!freshRoom) {
          console.log("Комната была удалена");
          return;
        }
        
        // Делаем ход ботом
        const updatedRoom = BotService.makeBotMove(freshRoom);
        
        // Обновляем состояние только если ход бота был успешным
        if (updatedRoom !== freshRoom) {
          console.log("Ход бота выполнен, обновляем состояние");
          
          // Сохраняем обновленную комнату на "сервере"
          await GameService.saveRoom(updatedRoom);
          
          // Обновляем список комнат
          await refreshRooms();
        }
      } catch (error) {
        console.error("Ошибка при ходе бота:", error);
      }
    }, 500); // Задержка для естественности
  }, [refreshRooms]);

  /**
   * Делает ход в игре
   */
  const makeMove = useCallback(async (index: number) => {
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
    
    try {
      // Обновляем комнату локально сразу, не дожидаясь ответа сервера
      setCurrentRoom(updatedRoom);
      
      // Сохраняем обновленную комнату на "сервере"
      await GameService.saveRoom(updatedRoom);
      
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
      
      // Обновляем список комнат
      await refreshRooms();
      
      // Если следующий ход - бота, и игра продолжается, запускаем его автоматически
      if (updatedRoom.status === "playing" && nextPlayer?.isBot) {
        triggerBotMove(updatedRoom);
      }
    } catch (error) {
      console.error("Ошибка при выполнении хода:", error);
    }
  }, [currentRoom, isSpectating, user, addItem, triggerBotMove, refreshRooms]);

  // Загружаем список комнат при первом рендере
  useEffect(() => {
    refreshRooms();
  }, [refreshRooms]);

  // Настраиваем периодическое обновление списка комнат
  useEffect(() => {
    const updateInterval = setInterval(() => {
      refreshRooms();
    }, 5000); // Обновляем каждые 5 секунд
    
    return () => clearInterval(updateInterval);
  }, [refreshRooms]);

  // Сохраняем состояние игры в localStorage для восстановления после перезагрузки страницы
  useEffect(() => {
    // Загружаем состояние при монтировании
    if (user && !currentRoom) {
      const savedRoomId = localStorage.getItem(`game_room_${user.username}`);
      const savedIsSpectating = localStorage.getItem(`game_spectating_${user.username}`);
      
      if (savedRoomId) {
        // Проверяем, есть ли комната с таким ID
        const room = availableRooms.find(r => r.id === savedRoomId);
        if (room) {
          // Проверяем, участвует ли пользователь в комнате или был в режиме наблюдения
          const isUserInRoom = room.players.some(p => p.username === user.username);
          const wasSpectating = savedIsSpectating === 'true';
          
          if (isUserInRoom || (wasSpectating && user.role === 'admin')) {
            setCurrentRoom(room);
            setIsSpectating(wasSpectating);
          } else {
            // Если пользователя нет в комнате, удаляем данные из localStorage
            localStorage.removeItem(`game_room_${user.username}`);
            localStorage.removeItem(`game_spectating_${user.username}`);
          }
        } else {
          // Если комнаты нет, удаляем данные из localStorage
          localStorage.removeItem(`game_room_${user.username}`);
          localStorage.removeItem(`game_spectating_${user.username}`);
        }
      }
    }
  }, [user, currentRoom, availableRooms]);
  
  // Сохраняем текущую комнату в localStorage
  useEffect(() => {
    if (user) {
      if (currentRoom) {
        localStorage.setItem(`game_room_${user.username}`, currentRoom.id);
        localStorage.setItem(`game_spectating_${user.username}`, String(isSpectating));
      } else {
        localStorage.removeItem(`game_room_${user.username}`);
        localStorage.removeItem(`game_spectating_${user.username}`);
      }
    }
  }, [user, currentRoom, isSpectating]);

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
    getRoomById,
    refreshRooms
  };
};