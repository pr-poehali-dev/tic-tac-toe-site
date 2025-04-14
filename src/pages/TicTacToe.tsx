import React from "react";
import { GameProvider } from "@/context/GameContext";
import GameManager from "@/components/TicTacToe/GameManager";

const TicTacToe: React.FC = () => {
  return (
    <GameProvider>
      <GameManager />
    </GameProvider>
  );
};

export default TicTacToe;