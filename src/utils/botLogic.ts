/**
 * Утилиты для логики бота в крестики-нолики
 */

import { calculateWinner } from "./game";

/**
 * Получает доступные ходы (пустые клетки) на текущей доске
 */
export const getAvailableMoves = (board: (string | null)[]): number[] => {
  return board.reduce<number[]>((moves, cell, index) => {
    if (cell === null) {
      moves.push(index);
    }
    return moves;
  }, []);
};

/**
 * Находит выигрышный ход для указанного символа, если он есть
 */
export const findWinningMove = (board: (string | null)[], symbol: string): number | null => {
  const availableMoves = getAvailableMoves(board);
  
  for (const move of availableMoves) {
    // Проверяем каждый возможный ход
    const newBoard = [...board];
    newBoard[move] = symbol;
    
    // Если этот ход ведет к победе, возвращаем его
    if (calculateWinner(newBoard) === symbol) {
      return move;
    }
  }
  
  return null;
};

/**
 * Находит блокирующий ход против выигрышного хода противника
 */
export const findBlockingMove = (board: (string | null)[], playerSymbol: string): number | null => {
  // Ищем выигрышный ход для игрока, который нужно заблокировать
  return findWinningMove(board, playerSymbol);
};

/**
 * Находит ход в углу, если он доступен
 */
export const findCornerMove = (board: (string | null)[]): number | null => {
  const corners = [0, 2, 6, 8];
  // Предпочтительно выбираем углы напротив тех, которые уже заняты противником
  
  // Проверяем, если противник занял угол, выбираем противоположный
  const availableCorners = corners.filter(corner => board[corner] === null);
  
  if (availableCorners.length > 0) {
    // Возвращаем первый доступный угол
    return availableCorners[0];
  }
  
  return null;
};

/**
 * Находит центральный ход, если он доступен
 */
export const findCenterMove = (board: (string | null)[]): number | null => {
  return board[4] === null ? 4 : null;
};

/**
 * Находит ход на стороне, если он доступен
 */
export const findSideMove = (board: (string | null)[]): number | null => {
  const sides = [1, 3, 5, 7];
  const availableSides = sides.filter(side => board[side] === null);
  
  if (availableSides.length > 0) {
    // Возвращаем первый доступный бок
    return availableSides[0];
  }
  
  return null;
};

/**
 * Находит случайный ход из доступных
 */
export const findRandomMove = (board: (string | null)[]): number | null => {
  const availableMoves = getAvailableMoves(board);
  
  if (availableMoves.length > 0) {
    return availableMoves[0]; // Берем первый доступный, чтобы было предсказуемо
  }
  
  return null;
};

/**
 * Находит лучший ход для бота с учетом стратегии:
 * 1. Выигрышный ход
 * 2. Блокирующий ход
 * 3. Центр
 * 4. Углы
 * 5. Стороны
 */
export const findBestMove = (
  board: (string | null)[],
  botSymbol: string,
  playerSymbol: string
): number | null => {
  // 1. Проверяем выигрышный ход
  const winningMove = findWinningMove(board, botSymbol);
  if (winningMove !== null) {
    return winningMove;
  }
  
  // 2. Проверяем блокирующий ход
  const blockingMove = findBlockingMove(board, playerSymbol);
  if (blockingMove !== null) {
    return blockingMove;
  }
  
  // 3. Пробуем занять центр
  const centerMove = findCenterMove(board);
  if (centerMove !== null) {
    return centerMove;
  }
  
  // 4. Пробуем занять угол
  const cornerMove = findCornerMove(board);
  if (cornerMove !== null) {
    return cornerMove;
  }
  
  // 5. Пробуем занять сторону
  const sideMove = findSideMove(board);
  if (sideMove !== null) {
    return sideMove;
  }
  
  // Если все стратегии не подошли, берем первый доступный ход
  const availableMoves = getAvailableMoves(board);
  return availableMoves.length > 0 ? availableMoves[0] : null;
};
