import React from "react";

interface SquareProps {
  value: string | null;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ value, onClick }) => {
  return (
    <button
      className="h-16 w-16 border border-gray-300 bg-white text-3xl font-bold text-center flex items-center justify-center hover:bg-gray-100 transition-colors"
      onClick={onClick}
    >
      {value}
    </button>
  );
};

export default Square;
