import React from "react";
import Game from "@/components/TicTacToe/Game";

const TicTacToe: React.FC = () => {
  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Крестики-нолики</h1>
        <p className="text-muted-foreground">Классическая игра для двух игроков</p>
      </div>
      
      <div className="flex justify-center">
        <Game />
      </div>
    </div>
  );
};

export default TicTacToe;
