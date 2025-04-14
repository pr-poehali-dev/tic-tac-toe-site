import React from "react";
import Square from "./Square";

interface BoardProps {
  squares: Array<string | null>;
  onClick: (i: number) => void;
}

const Board: React.FC<BoardProps> = ({ squares, onClick }) => {
  const renderSquare = (i: number) => {
    return <Square value={squares[i]} onClick={() => onClick(i)} />;
  };

  return (
    <div className="grid grid-cols-3 gap-1 max-w-fit">
      {[...Array(9)].map((_, i) => (
        <div key={i}>{renderSquare(i)}</div>
      ))}
    </div>
  );
};

export default Board;
