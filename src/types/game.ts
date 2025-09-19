// Импортируем тип Item из inventory для совместимости
import { Item as InventoryItem } from "@/types/inventory";

// Реэкспортируем тип для использования в game контексте
export type Item = InventoryItem;

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface Inventory {
  id: string;
  userId: string;
  items: InventoryItem[];
  gold: number;
  maxSlots: number;
}

export interface Player {
  id: string | number; // Может быть строкой (локально) или числом (из БД)
  username: string;
  symbol: string; // X или O
  stakeItemId: string | number; // ID предмета ставки
  stakeItemName?: string; // Название предмета (для истории)
  stakeItemValue?: number; // Стоимость предмета (для истории)
  isBot?: boolean;
  joinedAt?: string; // ISO дата присоединения
}

export interface GameRoom {
  id: string;
  roomCode: string;
  creatorId: string | number; // Может быть строкой (локально) или числом (из БД)
  players: Player[];
  currentTurn: string | number; // ID игрока, чей сейчас ход
  currentTurnPlayerId?: number; // Для совместимости с БД
  status: 'waiting' | 'playing' | 'finished';
  winner: string | null; // Имя победителя или null
  winnerUserId?: number | null; // ID победителя из БД
  board: (string | null)[]; // Игровое поле
  createdAt: number | string; // timestamp или ISO строка
  startedAt?: string | null; // Дата начала игры (ISO)
  finishedAt?: string | null; // Дата окончания игры (ISO)
  lastActivity: number | string; // timestamp последнего действия или ISO строка
  stakes: { [playerId: string]: string }; // Ставки игроков (itemId)
  gameData?: any; // Дополнительные данные игры
  botCheckScheduled: boolean; // Запланирована ли проверка для добавления бота
}

export interface GameContextType {
  availableRooms: GameRoom[];
  currentRoom: GameRoom | null;
  createRoom: (stakeItemId: string) => void;
  joinRoom: (roomId: string, stakeItemId: string) => void;
  leaveRoom: () => void;
  makeMove: (index: number) => void;
  spectateRoom: (roomId: string) => void;
  getRoomById: (roomId: string) => GameRoom | undefined;
  isWaiting: boolean;
  isPlaying: boolean;
  isSpectating: boolean;
  toggleBots: (enabled: boolean) => void;
  isBotsEnabled: () => boolean;
  refreshRooms: () => Promise<void>;
}