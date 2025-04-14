/**
 * Утилиты для логики бота ИИ в крестики-нолики
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
export const findBlockingMove = (board: (string | null)[], playerSymbol: string, botSymbol: string): number | null => {
  // Ищем выигрышный ход для игрока, который нужно заблокировать
  return findWinningMove(board, playerSymbol);
};

/**
 * Находит центральный ход, если он доступен
 */
export const findCenterMove = (board: (string | null)[]): number | null => {
  return board[4] === null ? 4 : null;
};

/**
 * Находит ход в углу, если он доступен
 */
export const findCornerMove = (board: (string | null)[]): number | null => {
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(corner => board[corner] === null);
  
  if (availableCorners.length > 0) {
    // Возвращаем случайный доступный угол
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }
  
  return null;
};

/**
 * Находит ход на стороне, если он доступен
 */
export const findSideMove = (board: (string | null)[]): number | null => {
  const sides = [1, 3, 5, 7];
  const availableSides = sides.filter(side => board[side] === null);
  
  if (availableSides.length > 0) {
    // Возвращаем случайный доступный бок
    return availableSides[Math.floor(Math.random() * availableSides.length)];
  }
  
  return null;
};

/**
 * Выбирает случайный ход из доступных
 */
export const findRandomMove = (board: (string | null)[]): number | null => {
  const availableMoves = getAvailableMoves(board);
  
  if (availableMoves.length > 0) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }
  
  return null;
};

/**
 * Находит лучший ход для бота по приоритету:
 * 1. Выигрышный ход
 * 2. Блокирующий ход
 * 3. Центр
 * 4. Углы
 * 5. Стороны
 * 6. Случайный ход
 */
export const findBestMove = (
  board: (string | null)[],
  botSymbol: string,
  playerSymbol: string
): number | null => {
  console.log("findBestMove вызван с параметрами:", {
    board,
    botSymbol,
    playerSymbol
  });
  
  // Проверяем наличие выигрышного хода
  const winningMove = findWinningMove(board, botSymbol);
  if (winningMove !== null) {
    console.log("Найден выигрышный ход:", winningMove);
    return winningMove;
  }
  
  // Проверяем наличие блокирующего хода
  const blockingMove = findBlockingMove(board, playerSymbol, botSymbol);
  if (blockingMove !== null) {
    console.log("Найден блокирующий ход:", blockingMove);
    return blockingMove;
  }
  
  // Пробуем занять центр
  const centerMove = findCenterMove(board);
  if (centerMove !== null) {
    console.log("Выбран центральный ход:", centerMove);
    return centerMove;
  }
  
  // Пробуем занять угол
  const cornerMove = findCornerMove(board);
  if (cornerMove !== null) {
    console.log("Выбран угловой ход:", cornerMove);
    return cornerMove;
  }
  
  // Пробуем занять сторону
  const sideMove = findSideMove(board);
  if (sideMove !== null) {
    console.log("Выбран ход на стороне:", sideMove);
    return sideMove;
  }
  
  // Если ничего не подошло, делаем случайный ход
  const randomMove = findRandomMove(board);
  console.log("Выбран случайный ход:", randomMove);
  return randomMove;
};