import { GameRoom, Player } from "@/types/game";
import { findBestMove } from "@/utils/botLogic";
import { calculateWinner, generateId } from "@/utils/game";
import { GameService } from "./gameService";

export class BotService {
  /**
   * Имя бота
   */
  static readonly BOT_NAME = "РобоТик";
  
  /**
   * Символ, которым играет бот (О)
   */
  static readonly BOT_SYMBOL = "О";
  
  /**
   * ID в инвентаре, который бот использует для ставки
   */
  static readonly BOT_STAKE_ITEM_ID = "bot-item";
  
  /**
   * Глобальная настройка для включения/отключения бота
   */
  static botEnabled = true;
  
  /**
   * Проверяет, нужно ли добавлять бота в комнату (если она ожидает игрока дольше минуты)
   */
  static shouldAddBot(room: GameRoom): boolean {
    // Если боты глобально отключены, не добавляем их
    if (!this.botEnabled) return false;
    
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
   * Включает автоматическое добавление ботов
   */
  static enableBots(): void {
    this.botEnabled = true;
  }
  
  /**
   * Отключает автоматическое добавление ботов
   */
  static disableBots(): void {
    this.botEnabled = false;
  }
  
  /**
   * Возвращает текущее состояние настройки ботов
   */
  static isBotsEnabled(): boolean {
    return this.botEnabled;
  }
  
  /**
   * Добавляет бота в комнату
   */
  static addBotToRoom(room: GameRoom): GameRoom {
    // Если боты отключены, возвращаем комнату без изменений
    if (!this.botEnabled) return room;
    
    // Создаем ID для бота
    const botId = generateId();
    
    // Находим первого игрока для определения его символа
    const firstPlayer = room.players[0];
    
    // Выбираем символ для бота, противоположный символу первого игрока
    const botSymbol = firstPlayer.symbol === "Х" ? "О" : "Х";
    
    // Создаем бота как игрока
    const botPlayer: Player = {
      id: botId,
      username: this.BOT_NAME,
      symbol: botSymbol,
      stakeItemId: this.BOT_STAKE_ITEM_ID,
      isBot: true // Помечаем, что это бот
    };
    
    // Обновляем комнату
    const updatedRoom: GameRoom = {
      ...room,
      players: [...room.players, botPlayer],
      status: "playing",
      lastActivity: Date.now(),
      currentTurn: firstPlayer.id, // Начинает игрок, а не бот
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
    // Если боты отключены, возвращаем комнату без изменений
    if (!this.botEnabled) return room;
    
    // Находим бота среди игроков
    const botPlayer = room.players.find(player => player.isBot);
    
    // Если бота нет, или статус игры не "playing", возвращаем комнату без изменений
    if (!botPlayer || room.status !== "playing") {
      console.log("Бот не найден или игра не активна", room.status);
      return room;
    }
    
    // Проверяем, что сейчас действительно ход бота
    if (room.currentTurn !== botPlayer.id) {
      console.log("Не ход бота (currentTurn)", room.currentTurn, botPlayer.id);
      return room;
    }
    
    // Находим игрока-человека
    const humanPlayer = room.players.find(player => !player.isBot);
    if (!humanPlayer) {
      console.log("Человек-игрок не найден");
      return room;
    }
    
    console.log("Бот делает ход:", { 
      botId: botPlayer.id,
      botSymbol: botPlayer.symbol,
      currentTurn: room.currentTurn,
      board: room.board
    });
    
    // Находим лучший ход для бота
    const botMove = findBestMove(
      room.board,
      botPlayer.symbol,
      humanPlayer.symbol
    );
    
    // Если бот не может сделать ход, возвращаем комнату без изменений
    if (botMove === null) {
      console.log("Бот не нашел возможных ходов");
      return room;
    }
    
    console.log("Бот выбрал ход:", botMove);
    
    // Создаем новую доску с ходом бота
    const newBoard = [...room.board];
    newBoard[botMove] = botPlayer.symbol;
    
    // Проверяем, есть ли победитель
    const winner = calculateWinner(newBoard);
    
    // Проверяем, заполнена ли доска (ничья)
    const isBoardFull = newBoard.every(cell => cell !== null);
    
    // Определяем новый статус игры
    const newStatus = winner || isBoardFull ? "finished" : "playing";
    
    // Определяем победителя (имя)
    const winnerName = winner === botPlayer.symbol 
      ? botPlayer.username 
      : winner === humanPlayer.symbol 
        ? humanPlayer.username 
        : null;
    
    // Обновляем комнату с ходом бота
    const updatedRoom: GameRoom = {
      ...room,
      board: newBoard,
      currentTurn: humanPlayer.id, // Передаем ход человеку
      status: newStatus,
      winner: winnerName,
      lastActivity: Date.now()
    };
    
    console.log("Обновленная комната после хода бота:", {
      board: updatedRoom.board,
      currentTurn: updatedRoom.currentTurn,
      status: updatedRoom.status,
      winner: updatedRoom.winner
    });
    
    return updatedRoom;
  }
}