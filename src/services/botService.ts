import { GameRoom, Player } from "@/types/game";
import { findBestMove } from "@/utils/botLogic";
import { generateId } from "@/utils/game";
import { GameService } from "./gameService";

export class BotService {
  /**
   * Имя бота
   */
  static readonly BOT_NAME = "РобоТик";
  
  /**
   * Символ, которым играет бот (O)
   */
  static readonly BOT_SYMBOL = "О";
  
  /**
   * ID в инвентаре, который бот использует для ставки
   */
  static readonly BOT_STAKE_ITEM_ID = "bot-item";
  
  /**
   * Проверяет, нужно ли добавлять бота в комнату (если она ожидает игрока дольше минуты)
   */
  static shouldAddBot(room: GameRoom): boolean {
    // Проверяем, что комната в состоянии ожидания
    if (room.status !== "waiting") return false;
    
    // Проверяем, что в комнате только один игрок
    if (room.players.length !== 1) return false;
    
    // Проверяем, что прошла минута с момента создания комнаты
    const oneMinuteInMs = 60 * 1000;
    const timeWaiting = Date.now() - room.createdAt;
    
    return timeWaiting >= oneMinuteInMs;
  }
  
  /**
   * Добавляет бота в комнату
   */
  static addBotToRoom(room: GameRoom): GameRoom {
    // Создаем ID для бота
    const botId = generateId();
    
    // Создаем бота как игрока
    const botPlayer: Player = {
      id: botId,
      username: this.BOT_NAME,
      symbol: this.BOT_SYMBOL,
      stakeItemId: this.BOT_STAKE_ITEM_ID,
      isBot: true // Помечаем, что это бот
    };
    
    // Обновляем комнату
    const updatedRoom: GameRoom = {
      ...room,
      players: [...room.players, botPlayer],
      status: "playing",
      lastActivity: Date.now(),
      stakes: {
        ...room.stakes,
        [botId]: this.BOT_STAKE_ITEM_ID
      }
    };
    
    return updatedRoom;
  }
  
  /**
   * Выполняет ход бота
   */
  static makeBotMove(room: GameRoom): GameRoom {
    // Проверяем, что сейчас ход бота
    const botPlayer = room.players.find(player => player.isBot);
    if (!botPlayer || room.currentTurn !== botPlayer.id) return room;
    
    // Находим игрока-человека
    const humanPlayer = room.players.find(player => !player.isBot);
    if (!humanPlayer) return room;
    
    // Находим лучший ход для бота
    const botMove = findBestMove(
      room.board,
      botPlayer.symbol,
      humanPlayer.symbol
    );
    
    // Если бот не может сделать ход, возвращаем комнату без изменений
    if (botMove === null) return room;
    
    // Обновляем доску
    const newBoard = [...room.board];
    newBoard[botMove] = botPlayer.symbol;
    
    // Проверяем, есть ли победитель
    const winner = this.checkWinner(newBoard);
    
    // Проверяем, заполнена ли доска
    const isBoardFull = newBoard.every(cell => cell !== null);
    
    // Обновляем комнату
    const updatedRoom: GameRoom = {
      ...room,
      board: newBoard,
      currentTurn: humanPlayer.id, // Передаем ход человеку
      status: winner || isBoardFull ? "finished" : "playing",
      winner: winner === botPlayer.symbol ? botPlayer.username : winner === humanPlayer.symbol ? humanPlayer.username : null,
      lastActivity: Date.now()
    };
    
    return updatedRoom;
  }
  
  /**
   * Проверяет, есть ли победитель (упрощенная версия calculateWinner)
   */
  private static checkWinner(board: (string | null)[]): string | null {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }
}
