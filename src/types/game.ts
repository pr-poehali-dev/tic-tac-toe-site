// Типы для игры крестики-нолики
import { Item } from "./inventory";

export interface Player {
  id: string;
  username: string;
  symbol: "Х" | "О";
  stakeItemId?: string; // ID предмета, поставленного на кон
}

export interface GameRoom {
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
  stakes: { [playerId: string]: string }; // Карта ставок: ключ - ID игрока, значение - ID предмета
}

export type GameStatus = "waiting" | "playing" | "finished";

export interface GameContextType {
  availableRooms: GameRoom[];
  currentRoom: GameRoom | null;
  joinRoom: (roomId: string, stakeItemId: string) => void;
  createRoom: (stakeItemId: string) => void;
  leaveRoom: () => void;
  makeMove: (index: number) => void;
  getRoomById: (roomId: string) => GameRoom | undefined;
  spectateRoom: (roomId: string) => void;
  isWaiting: boolean;
  isPlaying: boolean;
  isSpectating: boolean;
}