import { GameRoom, Player } from "@/types/game";
import { calculateWinner, generateId } from "@/utils/game";
import { Item } from "@/types/inventory";

// Пример данных для тестирования
const mockItems: Item[] = [
  {
    id: "item-1",
    name: "Подводный меч",
    rarity: "rare",
    type: "weapon",
    imageUrl: "/placeholder.svg",
    description: "Острый меч, не ржавеющий под водой",
    stats: { damage: 15, durability: 100 }
  },
  {
    id: "item-2",
    name: "Кораловый щит",
    rarity: "uncommon",
    type: "shield",
    imageUrl: "/placeholder.svg",
    description: "Щит из прочных кораллов",
    stats: { defense: 10, durability: 80 }
  },
  {
    id: "item-3",
    name: "Жемчужный амулет",
    rarity: "epic",
    type: "accessory",
    imageUrl: "/placeholder.svg",
    description: "Амулет, приносящий удачу в морских глубинах",
    stats: { luck: 20, magicPower: 15 }
  }
];

// Имитация наличия нескольких комнат
const mockRooms: GameRoom[] = [
  {
    id: "room-1",
    roomCode: "A1B2",
    creatorId: "player-1",
    players: [
      {
        id: "player-1",
        username: "Дайвер",
        symbol: "X",
        stakeItemId: "item-1"
      }
    ],
    status: "waiting",
    winner: null,
    board: [null, null, null, null, null, null, null, null, null],
    currentTurn: "player-1",
    createdAt: Date.now() - 10 * 60 * 1000, // 10 минут назад
    lastActivity: Date.now() - 5 * 60 * 1000, // 5 минут назад
    stakes: {
      "player-1": "item-1"
    },
    botCheckScheduled: false
  },
  {
    id: "room-2",
    roomCode: "C3D4",
    creatorId: "player-3",
    players: [
      {
        id: "player-3",
        username: "Тритон",
        symbol: "X",
        stakeItemId: "item-2"
      },
      {
        id: "player-4",
        username: "Русалка",
        symbol: "O",
        stakeItemId: "item-3"
      }
    ],
    status: "playing",
    winner: null,
    board: [null, "X", null, null, "O", null, null, null, null],
    currentTurn: "player-4",
    createdAt: Date.now() - 15 * 60 * 1000, // 15 минут назад
    lastActivity: Date.now() - 2 * 60 * 1000, // 2 минуты назад
    stakes: {
      "player-3": "item-2",
      "player-4": "item-3"
    },
    botCheckScheduled: false
  }
];

// Сервис для работы с игрой
export class GameService {
  // Получение всех комнат
  static async fetchRooms(): Promise<GameRoom[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve([...mockRooms]), 500);
    });
  }

  // Получение комнаты по ID
  static async fetchRoomById(roomId: string): Promise<GameRoom | null> {
    return new Promise(resolve => {
      const room = mockRooms.find(r => r.id === roomId) || null;
      setTimeout(() => resolve(room), 300);
    });
  }

  // Создание новой комнаты
  static async createRoom(username: string, stakeItemId: string): Promise<GameRoom> {
    const playerId = generateId();
    const roomId = generateId();
    
    const player: Player = {
      id: playerId,
      username,
      symbol: "X",
      stakeItemId
    };
    
    const newRoom: GameRoom = {
      id: roomId,
      roomCode: `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
      creatorId: playerId,
      players: [player],
      status: "waiting",
      winner: null,
      board: Array(9).fill(null),
      currentTurn: playerId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      stakes: {
        [playerId]: stakeItemId
      },
      botCheckScheduled: false
    };
    
    return new Promise(resolve => {
      // В реальном приложении здесь был бы запрос на сервер
      mockRooms.push(newRoom);
      setTimeout(() => resolve(newRoom), 300);
    });
  }

  // Присоединение к комнате
  static async joinRoom(roomId: string, username: string, stakeItemId: string): Promise<GameRoom> {
    return new Promise((resolve, reject) => {
      const roomIndex = mockRooms.findIndex(r => r.id === roomId);
      
      if (roomIndex === -1) {
        return reject(new Error("Комната не найдена"));
      }
      
      const room = mockRooms[roomIndex];
      
      if (room.status !== "waiting" || room.players.length >= 2) {
        return reject(new Error("Невозможно присоединиться к этой комнате"));
      }
      
      const playerId = generateId();
      
      const newPlayer: Player = {
        id: playerId,
        username,
        symbol: "O",
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
      
      mockRooms[roomIndex] = updatedRoom;
      
      setTimeout(() => resolve(updatedRoom), 300);
    });
  }

  // Выполнение хода
  static async makeMove(roomId: string, playerId: string, index: number): Promise<GameRoom> {
    return new Promise((resolve, reject) => {
      const roomIndex = mockRooms.findIndex(r => r.id === roomId);
      
      if (roomIndex === -1) {
        return reject(new Error("Комната не найдена"));
      }
      
      const room = mockRooms[roomIndex];
      
      if (room.status !== "playing" || room.currentTurn !== playerId) {
        return reject(new Error("Сейчас не ваш ход"));
      }
      
      if (room.board[index] !== null) {
        return reject(new Error("Эта клетка уже занята"));
      }
      
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        return reject(new Error("Игрок не найден"));
      }
      
      // Выполняем ход
      const newBoard = [...room.board];
      newBoard[index] = player.symbol;
      
      // Проверяем, выиграл ли кто-то
      const winner = calculateWinner(newBoard);
      const boardFull = newBoard.every(cell => cell !== null);
      
      // Определяем следующего игрока
      const nextPlayer = room.players.find(p => p.id !== playerId);
      
      const updatedRoom = {
        ...room,
        board: newBoard,
        currentTurn: nextPlayer ? nextPlayer.id : playerId,
        status: winner || boardFull ? "finished" : "playing",
        winner: winner ? player.username : null,
        lastActivity: Date.now()
      };
      
      mockRooms[roomIndex] = updatedRoom;
      
      setTimeout(() => resolve(updatedRoom), 200);
    });
  }

  // Получение предмета по ID
  static getItemById(itemId: string): Item | undefined {
    return mockItems.find(item => item.id === itemId);
  }

  // Выход из комнаты
  static async leaveRoom(roomId: string, username: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const roomIndex = mockRooms.findIndex(r => r.id === roomId);
      
      if (roomIndex === -1) {
        return reject(new Error("Комната не найдена"));
      }
      
      const room = mockRooms[roomIndex];
      const playerIndex = room.players.findIndex(p => p.username === username);
      
      if (playerIndex === -1) {
        return reject(new Error("Игрок не найден в комнате"));
      }
      
      // Если игроков будет 0, удаляем комнату
      if (room.players.length <= 1) {
        mockRooms.splice(roomIndex, 1);
      } else {
        // Иначе обновляем комнату
        const updatedPlayers = [...room.players];
        updatedPlayers.splice(playerIndex, 1);
        
        mockRooms[roomIndex] = {
          ...room,
          players: updatedPlayers,
          status: "waiting",
          lastActivity: Date.now()
        };
      }
      
      setTimeout(() => resolve(true), 200);
    });
  }
};