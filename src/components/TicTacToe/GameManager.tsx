import React from "react";
import { useGame } from "@/context/GameContext";
import GameLobby from "./GameLobby";
import GameRoom from "./GameRoom";

const GameManager: React.FC = () => {
  const { currentRoom } = useGame();
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Крестики-нолики</h1>
        <p className="text-muted-foreground mb-4">Классическая игра для двух игроков</p>
      </div>
      
      {currentRoom ? <GameRoom /> : <GameLobby />}
    </div>
  );
};

export default GameManager;