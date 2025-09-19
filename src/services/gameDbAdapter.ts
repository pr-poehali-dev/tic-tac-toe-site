import { GameRoom, Player } from "@/types/game";

/**
 * Адаптер для работы с игровыми комнатами через базу данных
 * Пока использует существующий API для совместимости
 */

// Демо-данные которые имитируют ответ из БД
const DEMO_DB_ROOMS = [
  {
    id: 'demo-waiting-room',
    room_code: 'WAIT01',
    creator_id: 1,
    current_turn_player_id: null,
    status: 'waiting',
    winner_user_id: null,
    board: [null, null, null, null, null, null, null, null, null],
    game_data: null,
    created_at: new Date().toISOString(),
    started_at: null,
    finished_at: null,
    last_activity: new Date().toISOString(),
    bot_check_scheduled: false,
    players: [
      {
        id: 1,
        user_id: 1,
        symbol: 'X',
        is_bot: false,
        stake_item_id: 1,
        stake_item_name: 'Деревянный меч',
        stake_item_value: 10,
        joined_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'demo-playing-room',
    room_code: 'PLAY01',
    creator_id: 1,
    current_turn_player_id: 1,
    status: 'playing',
    winner_user_id: null,
    board: ['X', 'O', null, 'O', 'X', null, null, null, 'X'],
    game_data: null,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    started_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    finished_at: null,
    last_activity: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    bot_check_scheduled: false,
    players: [
      {
        id: 1,
        user_id: 1,
        symbol: 'X',
        is_bot: false,
        stake_item_id: 1,
        stake_item_name: 'Деревянный меч',
        stake_item_value: 10,
        joined_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        user_id: 999,
        symbol: 'O',
        is_bot: true,
        stake_item_id: 2,
        stake_item_name: 'Золотая монета',
        stake_item_value: 1,
        joined_at: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      }
    ]
  }
];

export class GameDbAdapter {
  /**
   * Преобразует данные из БД в формат клиента
   */
  static dbRoomToClientRoom(dbRoom: any): GameRoom {
    return {
      id: dbRoom.id,
      roomCode: dbRoom.room_code,
      creatorId: dbRoom.creator_id.toString(),
      players: dbRoom.players?.map((p: any) => this.dbPlayerToClientPlayer(p)) || [],
      currentTurn: dbRoom.current_turn_player_id?.toString() || '',
      status: dbRoom.status,
      winner: dbRoom.winner_user_id ? `user_${dbRoom.winner_user_id}` : null,
      board: dbRoom.board,
      createdAt: new Date(dbRoom.created_at).getTime(),
      lastActivity: new Date(dbRoom.last_activity).getTime(),
      stakes: this.buildStakesMap(dbRoom.players || []),
      botCheckScheduled: dbRoom.bot_check_scheduled || false,
      // Дополнительные поля для совместимости
      startedAt: dbRoom.started_at,
      finishedAt: dbRoom.finished_at,
      gameData: dbRoom.game_data
    };
  }

  /**
   * Преобразует игрока из БД в формат клиента
   */
  static dbPlayerToClientPlayer(dbPlayer: any): Player {
    return {
      id: dbPlayer.user_id.toString(),
      username: `user_${dbPlayer.user_id}`, // Временно, пока нет связи с таблицей users
      symbol: dbPlayer.symbol,
      stakeItemId: dbPlayer.stake_item_id.toString(),
      stakeItemName: dbPlayer.stake_item_name,
      stakeItemValue: dbPlayer.stake_item_value,
      isBot: dbPlayer.is_bot,
      joinedAt: dbPlayer.joined_at
    };
  }

  /**
   * Строит карту ставок из игроков
   */
  static buildStakesMap(players: any[]): { [playerId: string]: string } {
    const stakes: { [playerId: string]: string } = {};
    players.forEach(player => {
      stakes[player.user_id.toString()] = player.stake_item_id.toString();
    });
    return stakes;
  }

  /**
   * Получает комнаты из "базы данных" (пока демо-данные)
   */
  static async fetchRoomsFromDb(): Promise<GameRoom[]> {
    // Имитация задержки запроса к БД
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      // В будущем здесь будет реальный запрос к БД через backend API
      // const response = await fetch('/api/game-rooms');
      // const result = await response.json();
      // return result.data.rooms.map(room => this.dbRoomToClientRoom(room));
      
      // Пока используем демо-данные
      return DEMO_DB_ROOMS.map(room => this.dbRoomToClientRoom(room));
    } catch (error) {
      console.error('Ошибка загрузки комнат из БД:', error);
      return [];
    }
  }

  /**
   * Сохраняет комнату в БД
   */
  static async saveRoomToDb(room: GameRoom): Promise<boolean> {
    // Имитация задержки запроса к БД
    await new Promise(resolve => setTimeout(resolve, 150));
    
    try {
      // В будущем здесь будет реальный запрос к БД через backend API
      console.log('Сохранение комнаты в БД:', room.id);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения комнаты в БД:', error);
      return false;
    }
  }

  /**
   * Удаляет комнату из БД
   */
  static async deleteRoomFromDb(roomId: string): Promise<boolean> {
    // Имитация задержки запроса к БД
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // В будущем здесь будет реальный запрос к БД через backend API
      console.log('Удаление комнаты из БД:', roomId);
      return true;
    } catch (error) {
      console.error('Ошибка удаления комнаты из БД:', error);
      return false;
    }
  }

  /**
   * Присоединение к комнате в БД
   */
  static async joinRoomInDb(roomId: string, userId: number, stakeData: {
    itemId: string;
    itemName: string;
    itemValue: number;
  }): Promise<GameRoom | null> {
    // Имитация задержки запроса к БД
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      // В будущем здесь будет реальный запрос к БД через backend API
      console.log('Присоединение к комнате в БД:', { roomId, userId, stakeData });
      
      // Пока возвращаем null - логика остается в клиенте
      return null;
    } catch (error) {
      console.error('Ошибка присоединения к комнате в БД:', error);
      return null;
    }
  }

  /**
   * Создание комнаты в БД
   */
  static async createRoomInDb(creatorId: number, stakeData: {
    itemId: string;
    itemName: string;
    itemValue: number;
  }): Promise<GameRoom | null> {
    // Имитация задержки запроса к БД
    await new Promise(resolve => setTimeout(resolve, 250));
    
    try {
      // В будущем здесь будет реальный запрос к БД через backend API
      console.log('Создание комнаты в БД:', { creatorId, stakeData });
      
      // Пока возвращаем null - логика остается в клиенте
      return null;
    } catch (error) {
      console.error('Ошибка создания комнаты в БД:', error);
      return null;
    }
  }

  /**
   * Совершение хода в БД
   */
  static async makeMoveInDb(roomId: string, userId: number, position: number): Promise<GameRoom | null> {
    // Имитация задержки запроса к БД
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // В будущем здесь будет реальный запрос к БД через backend API
      console.log('Ход в БД:', { roomId, userId, position });
      
      // Пока возвращаем null - логика остается в клиенте
      return null;
    } catch (error) {
      console.error('Ошибка хода в БД:', error);
      return null;
    }
  }

  /**
   * Получает статистику комнат из БД
   */
  static async getRoomsStatsFromDb(): Promise<{
    total: number;
    waiting: number;
    playing: number;
    finished: number;
  }> {
    const rooms = await this.fetchRoomsFromDb();
    
    return {
      total: rooms.length,
      waiting: rooms.filter(r => r.status === 'waiting').length,
      playing: rooms.filter(r => r.status === 'playing').length,
      finished: rooms.filter(r => r.status === 'finished').length
    };
  }
}