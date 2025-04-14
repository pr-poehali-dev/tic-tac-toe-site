import { Item } from "./inventory";

/**
 * Интерфейс для игрока в игре
 */
export interface Player {
  id: string;
  username: string;
  symbol: string;
  stakeItemId: string;
  isBot?: boolean; // Флаг, указывающий, что это бот
}

/**
 * Статус игровой комнаты
 */
export type GameStatus = "waiting" | "playing" | "finished";

/**
 * Интерфейс для игровой комнаты
 */
export interface GameRoom {
  id: string;
  roomCode: string;
  creatorId: string;
  players: Player[];
  currentTurn: string;
  status: GameStatus;
  winner: string | null;
  board: (string | null)[];
  createdAt: number;
  lastActivity: number;
  stakes: { [playerId: string]: string }; // Маппинг ID игрока на ID предмета ставки
  botCheckScheduled?: boolean; // Флаг, указывающий, что запланирована проверка бота
}

/**
 * Интерфейс для контекста игры
 */
export interface GameContextType {
  availableRooms: GameRoom[];
  currentRoom: GameRoom | null;
  joinRoom: (roomId: string, stakeItemId: string) => void;
  createRoom: (stakeItemId: string) => void;
  leaveRoom: () => void;
  makeMove: (index: number) => void;
  getRoomById: (roomId: string) => GameRoom | undefined;
  spectateRoom: (roomId: string) => void;
  isWaiting?: boolean;
  isPlaying?: boolean;
  isSpectating: boolean;
}
