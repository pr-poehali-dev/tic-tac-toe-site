import { GameRoom, Item } from "@/types/game";
import { ITEMS } from "./itemsData";

// Экспортируем ITEMS как itemsData для совместимости
export const itemsData = ITEMS;

// Имитация серверной части для хранения игровых комнат
let serverRooms: GameRoom[] = [];

export class GameService {
  /**
   * Загружает все доступные комнаты
   */
  static async fetchRooms(): Promise<GameRoom[]> {
    // Имитация задержки сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...serverRooms];
  }

  /**
   * Сохраняет комнату на "сервере"
   */
  static async saveRoom(room: GameRoom): Promise<GameRoom> {
    // Имитация задержки сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const existingRoomIndex = serverRooms.findIndex(r => r.id === room.id);
    
    if (existingRoomIndex >= 0) {
      // Обновляем существующую комнату
      serverRooms[existingRoomIndex] = { ...room };
      return serverRooms[existingRoomIndex];
    } else {
      // Добавляем новую комнату
      serverRooms.push({ ...room });
      return room;
    }
  }

  /**
   * Удаляет комнату с "сервера"
   */
  static async deleteRoom(roomId: string): Promise<boolean> {
    // Имитация задержки сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const initialLength = serverRooms.length;
    serverRooms = serverRooms.filter(room => room.id !== roomId);
    
    return serverRooms.length < initialLength;
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
    serverRooms = [...serverRooms, ...rooms];
  }

  /**
   * Очищает все комнаты (для тестирования)
   */
  static clearRooms(): void {
    serverRooms = [];
  }
}