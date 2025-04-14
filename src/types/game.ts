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
  id: string;
  username: string;
  symbol: string; // X или O
  stakeItemId: string;
  isBot?: boolean;
}

export interface GameRoom {
  id: string;
  roomCode: string;
  creatorId: string;
  players: Player[];
  currentTurn: string; // ID игрока, чей сейчас ход
  status: 'waiting' | 'playing' | 'finished';
  winner: string | null; // Имя победителя или null
  board: (string | null)[]; // Игровое поле
  createdAt: number; // timestamp
  lastActivity: number; // timestamp последнего действия
  stakes: { [playerId: string]: string }; // Ставки игроков (itemId)
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