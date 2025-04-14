// Типы для игры крестики-нолики

export interface Player {
  id: string;
  username: string;
  symbol: "Х" | "О";
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
}

export type GameStatus = "waiting" | "playing" | "finished";

export interface GameContextType {
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
