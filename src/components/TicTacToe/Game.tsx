import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Board from "./Board";

const Game: React.FC = () => {
  const [history, setHistory] = useState<Array<{ squares: Array<string | null> }>>([
    { squares: Array(9).fill(null) },
  ]);
  const [stepNumber, setStepNumber] = useState<number>(0);
  const [xIsNext, setXIsNext] = useState<boolean>(true);

  const calculateWinner = (squares: Array<string | null>): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    
    return null;
  };

  const handleClick = (i: number) => {
    const currentHistory = history.slice(0, stepNumber + 1);
    const current = currentHistory[currentHistory.length - 1];
    const squares = [...current.squares];
    
    // Если уже есть победитель или клетка уже заполнена
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    
    squares[i] = xIsNext ? "Х" : "О";
    
    setHistory([...currentHistory, { squares }]);
    setStepNumber(currentHistory.length);
    setXIsNext(!xIsNext);
  };

  const jumpTo = (step: number) => {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  };

  const resetGame = () => {
    setHistory([{ squares: Array(9).fill(null) }]);
    setStepNumber(0);
    setXIsNext(true);
  };

  const current = history[stepNumber];
  const winner = calculateWinner(current.squares);
  let status;
  
  if (winner) {
    status = `Победитель: ${winner}`;
  } else if (stepNumber === 9) {
    status = "Ничья!";
  } else {
    status = `Следующий ход: ${xIsNext ? "Х" : "О"}`;
  }

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-12">
      <div className="flex flex-col gap-4">
        <div className="text-xl font-bold mb-2">{status}</div>
        <Board squares={current.squares} onClick={handleClick} />
        <Button onClick={resetGame} className="mt-2 w-full">Начать заново</Button>
      </div>
      
      <div className="w-full md:w-48">
        <h3 className="font-bold mb-2">История ходов:</h3>
        <div className="flex flex-col gap-2">
          {history.map((_, move) => (
            <Button 
              key={move}
              size="sm"
              variant={move === stepNumber ? "default" : "outline"}
              onClick={() => jumpTo(move)}
            >
              {move > 0 ? `Ход #${move}` : "К началу игры"}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
