// Утилиты для игры

/**
 * Генератор уникальных ID (только цифры)
 */
export const generateId = (): string => {
  // Генерация ID из 9 случайных цифр
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

/**
 * Генератор кода комнаты (6 символов)
 * Исключает похожие символы (I,1,O,0) для удобства использования
 */
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Проверка на победителя в крестиках-ноликах
 * @param squares - Массив клеток игрового поля
 * @returns Символ победителя или null
 */
export const calculateWinner = (squares: Array<string | null>): string | null => {
  const lines = [
    [0, 1, 2], // горизонтальная верхняя
    [3, 4, 5], // горизонтальная средняя
    [6, 7, 8], // горизонтальная нижняя
    [0, 3, 6], // вертикальная левая
    [1, 4, 7], // вертикальная средняя
    [2, 5, 8], // вертикальная правая
    [0, 4, 8], // диагональ сверху слева
    [2, 4, 6], // диагональ сверху справа
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  
  return null;
};

/**
 * Проверка, заполнено ли игровое поле
 * @param board - Игровое поле
 * @returns true если поле заполнено
 */
export const isBoardFull = (board: Array<string | null>): boolean => {
  return board.every(cell => cell !== null);
};

/**
 * Создает начальное игровое поле
 * @returns Пустое игровое поле 3x3
 */
export const createInitialBoard = (): Array<string | null> => {
  return Array(9).fill(null);
};