import React from "react";
import Game from "@/components/TicTacToe/Game";
import { useAuth } from "@/context/AuthContext";

const TicTacToe: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Крестики-нолики</h1>
        <p className="text-muted-foreground mb-2">Классическая игра для двух игроков</p>
        <p className="text-sm font-medium">Играет: {user?.username}</p>
      </div>
      
      <div className="flex justify-center">
        <Game />
      </div>
    </div>
  );
};

export default TicTacToe;