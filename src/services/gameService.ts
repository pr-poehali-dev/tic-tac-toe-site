import { GameRoom } from "@/types/game";

/**
 * Сервис для работы с игровыми данными
 * В реальном приложении здесь были бы API-запросы к серверу
 */
export class GameService {
  /**
   * Получает список доступных комнат
   * @returns Промис с массивом комнат
   */
  static async fetchRooms(): Promise<GameRoom[]> {
    // Имитация API-запроса
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockRooms: GameRoom[] = [
          {
            id: "room1",
            roomCode: "ABC123",
            creatorId: "player1",
            players: [{
              id: "player1",
              username: "Игрок 1",
              symbol: "Х"
            }],
            currentTurn: "player1",
            status: "waiting",
            winner: null,
            board: Array(9).fill(null),
            createdAt: Date.now() - 60000,
            lastActivity: Date.now() - 50000
          }
        ];
        resolve(mockRooms);
      }, 300);
    });
  }

  /**
   * Создает новую комнату на сервере
   * @param room - Данные новой комнаты
   * @returns Промис с созданной комнатой
   */
  static async createRoom(room: GameRoom): Promise<GameRoom> {
    // Имитация API-запроса
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(room);
      }, 200);
    });
  }

  /**
   * Обновляет комнату на сервере
   * @param room - Обновленные данные комнаты
   * @returns Промис с обновленной комнатой
   */
  static async updateRoom(room: GameRoom): Promise<GameRoom> {
    // Имитация API-запроса
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(room);
      }, 150);
    });
  }

  /**
   * Удаляет комнату с сервера
   * @param roomId - ID комнаты для удаления
   * @returns Промис, возвращающий успех операции
   */
  static async deleteRoom(roomId: string): Promise<boolean> {
    // Имитация API-запроса
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 150);
    });
  }
}
