import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container max-w-5xl py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Добро пожаловать в игру "Крестики-нолики"</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Классическая игра для двух игроков теперь онлайн!
      </p>
      
      <div className="mb-12 max-w-md mx-auto">
        <p className="mb-6">
          Играйте с друзьями или присоединяйтесь к открытым играм других пользователей.
        </p>
        
        {isAuthenticated ? (
          <Link to="/game">
            <Button size="lg" className="w-full">
              Начать игру
            </Button>
          </Link>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Войдите или зарегистрируйтесь, чтобы начать игру
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/login">
                <Button variant="outline">Вход</Button>
              </Link>
              <Link to="/register">
                <Button>Регистрация</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Поиск игры</h3>
          <p className="text-muted-foreground mb-2">
            Присоединяйтесь к существующим играм других пользователей
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Создание игры</h3>
          <p className="text-muted-foreground mb-2">
            Создавайте свои игры и приглашайте друзей
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Онлайн-игроки</h3>
          <p className="text-muted-foreground mb-2">
            Играйте в реальном времени с другими игроками
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;