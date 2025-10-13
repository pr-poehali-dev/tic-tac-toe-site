import { GameRoom, Item } from "@/types/game";
import { ITEMS } from "./itemsData";
import { GameDbAdapter } from "./gameDbAdapter";

// Экспортируем ITEMS как itemsData для совместимости
export const itemsData = ITEMS;

// URL для API (когда будет доступно)
const GAME_ROOMS_API_URL = 'https://functions.poehali.dev/game-rooms'; // Пока недоступно

// Ключ для localStorage (резервный вариант)
const ROOMS_STORAGE_KEY = 'game_rooms_local_storage';

// Флаг использования базы данных (переключается автоматически)
let USE_DATABASE = true;

export class GameService {
  /**
   * Загружает комнаты из localStorage (имитация базы данных)
   */
  private static getLocalRooms(): GameRoom[] {
    try {
      const stored = localStorage.getItem(ROOMS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Ошибка загрузки комнат из localStorage:', error);
      return [];
    }
  }

  /**
   * Сохраняет комнаты в localStorage
   */
  private static saveLocalRooms(rooms: GameRoom[]): void {
    try {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    } catch (error) {
      console.error('Ошибка сохранения комнат в localStorage:', error);
    }
  }

  /**
   * Загружает все доступные комнаты
   */
  static async fetchRooms(): Promise<GameRoom[]> {
    try {
      if (USE_DATABASE) {
        // Пытаемся загрузить из БД через адаптер
        try {
          return await GameDbAdapter.fetchRoomsFromDb();
        } catch (error) {
          console.warn('Ошибка загрузки из БД, переключаемся на localStorage:', error);
          USE_DATABASE = false;
        }
      }
      
      // Резервный вариант - localStorage
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const rooms = this.getLocalRooms();
      
      // Очищаем старые комнаты (старше 1 часа)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const activeRooms = rooms.filter(room => {
        const lastActivity = typeof room.lastActivity === 'string' 
          ? new Date(room.lastActivity).getTime() 
          : room.lastActivity;
        return lastActivity > oneHourAgo || room.status === 'playing';
      });
      
      if (activeRooms.length !== rooms.length) {
        this.saveLocalRooms(activeRooms);
      }
      
      return activeRooms;
    } catch (error) {
      console.error('Ошибка загрузки комнат:', error);
      return [];
    }
  }

  /**
   * Сохраняет комнату на "сервере"
   */
  static async saveRoom(room: GameRoom): Promise<GameRoom> {
    // Имитация задержки сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      // В будущем здесь будет реальный API запрос
      // const response = await fetch(GAME_ROOMS_API_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(room)
      // });
      // return await response.json();
      
      // Пока используем localStorage
      const rooms = this.getLocalRooms();
      const existingRoomIndex = rooms.findIndex(r => r.id === room.id);
      
      if (existingRoomIndex >= 0) {
        // Обновляем существующую комнату
        rooms[existingRoomIndex] = { ...room };
      } else {
        // Добавляем новую комнату
        rooms.push({ ...room });
      }
      
      this.saveLocalRooms(rooms);
      return room;
    } catch (error) {
      console.error('Ошибка сохранения комнаты:', error);
      throw error;
    }
  }

  /**
   * Удаляет комнату с "сервера"
   */
  static async deleteRoom(roomId: string): Promise<boolean> {
    // Имитация задержки сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      // В будущем здесь будет реальный API запрос
      // const response = await fetch(`${GAME_ROOMS_API_URL}?room_id=${roomId}`, {
      //   method: 'DELETE'
      // });
      // return response.ok;
      
      // Пока используем localStorage
      const rooms = this.getLocalRooms();
      const initialLength = rooms.length;
      const filteredRooms = rooms.filter(room => room.id !== roomId);
      
      this.saveLocalRooms(filteredRooms);
      return filteredRooms.length < initialLength;
    } catch (error) {
      console.error('Ошибка удаления комнаты:', error);
      return false;
    }
  }

  /**
   * Присоединение к комнате через API
   */
  static async joinRoom(roomId: string, userId: number, stakeItemId: string, stakeItemName: string, stakeItemValue: number): Promise<GameRoom> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // В будущем здесь будет реальный API запрос
      // const response = await fetch(GAME_ROOMS_API_URL, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     action: 'join',
      //     room_id: roomId,
      //     user_id: userId,
      //     stake_item_id: stakeItemId,
      //     stake_item_name: stakeItemName,
      //     stake_item_value: stakeItemValue
      //   })
      // });
      // const result = await response.json();
      // return result.data.room;
      
      // Пока логика остается в клиенте - это будет перенесено в API
      throw new Error('Метод пока не реализован - используйте useGameActions');
    } catch (error) {
      console.error('Ошибка присоединения к комнате:', error);
      throw error;
    }
  }

  /**
   * Создание комнаты через API
   */
  static async createRoom(creatorId: number, stakeItemId: string, stakeItemName: string, stakeItemValue: number): Promise<GameRoom> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // В будущем здесь будет реальный API запрос
      // const response = await fetch(GAME_ROOMS_API_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     creator_id: creatorId,
      //     stake_item_id: stakeItemId,
      //     stake_item_name: stakeItemName,
      //     stake_item_value: stakeItemValue
      //   })
      // });
      // const result = await response.json();
      // return result.data.room;
      
      // Пока логика остается в клиенте - это будет перенесено в API
      throw new Error('Метод пока не реализован - используйте useGameActions');
    } catch (error) {
      console.error('Ошибка создания комнаты:', error);
      throw error;
    }
  }

  /**
   * Совершение хода через API
   */
  static async makeMove(roomId: string, userId: number, position: number): Promise<GameRoom> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      // В будущем здесь будет реальный API запрос
      // const response = await fetch(GAME_ROOMS_API_URL, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     action: 'move',
      //     room_id: roomId,
      //     user_id: userId,
      //     position: position
      //   })
      // });
      // const result = await response.json();
      // return result.data.room;
      
      // Пока логика остается в клиенте - это будет перенесено в API
      throw new Error('Метод пока не реализован - используйте useGameActions');
    } catch (error) {
      console.error('Ошибка совершения хода:', error);
      throw error;
    }
  }

  /**
   * Получает предмет по ID
   */
  static getItemById(itemId: string): Item | null {
    return itemsData.find(item => item.id === itemId) || null;
  }

  /**
   * Добавляет тестовые комнаты (для разработки)
   */
  static addTestRooms(rooms: GameRoom[]): void {
    const existingRooms = this.getLocalRooms();
    const allRooms = [...existingRooms, ...rooms];
    this.saveLocalRooms(allRooms);
  }

  /**
   * Очищает все комнаты (для тестирования)
   */
  static clearRooms(): void {
    this.saveLocalRooms([]);
  }

  /**
   * Получает статистику по комнатам
   */
  static async getRoomsStats(): Promise<{ total: number; waiting: number; playing: number; finished: number }> {
    const rooms = await this.fetchRooms();
    return {
      total: rooms.length,
      waiting: rooms.filter(r => r.status === 'waiting').length,
      playing: rooms.filter(r => r.status === 'playing').length,
      finished: rooms.filter(r => r.status === 'finished').length
    };
  }
}