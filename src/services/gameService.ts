import { GameRoom } from "@/types/game";
import { Item } from "@/types/inventory";
import { generateId } from "@/utils/game";

// Импортируем ITEMS вместо ITEMS_DATA
import { ITEMS, getItemById } from "./itemsData";

export class GameService {
  // Имитация получения комнат с сервера
  static async fetchRooms(): Promise<GameRoom[]> {
    return new Promise((resolve) => {
      // Имитация задержки сети
      setTimeout(() => {
        // Возвращаем пустой массив, так как комнаты будут создаваться в процессе игры
        resolve([]);
      }, 500);
    });
  }
  
  // Имитация получения комнаты по ID
  static async fetchRoomById(roomId: string): Promise<GameRoom | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // В реальном приложении здесь был бы запрос к серверу
        // В демо версии просто возвращаем null, так как комнаты хранятся в состоянии на клиенте
        resolve(null);
      }, 200);
    });
  }
  
  // Имитация создания комнаты
  static async createRoom(room: GameRoom): Promise<GameRoom> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // В реальном приложении здесь был бы запрос к серверу для сохранения комнаты
        resolve({
          ...room,
          id: room.id || generateId()
        });
      }, 300);
    });
  }
  
  // Имитация обновления комнаты
  static async updateRoom(room: GameRoom): Promise<GameRoom> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // В реальном приложении здесь был бы запрос к серверу для обновления комнаты
        resolve(room);
      }, 300);
    });
  }
  
  // Имитация удаления комнаты
  static async deleteRoom(roomId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // В реальном приложении здесь был бы запрос к серверу для удаления комнаты
        resolve(true);
      }, 300);
    });
  }
  
  // Имитация получения предмета по ID
  static getItemById(itemId: string): Item | null {
    // Используем функцию getItemById из itemsData, если она доступна, 
    // иначе ищем предмет сами
    const item = getItemById ? getItemById(itemId) : ITEMS.find(item => item.id === itemId);
    return item || null;
  }
}