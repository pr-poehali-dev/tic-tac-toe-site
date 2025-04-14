import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const location = useLocation();
  
  // Если мы на странице авторизации или регистрации, не показываем хедер
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }
  
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            🎮 Игры
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium hover:underline">
              Крестики-нолики
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="outline" size="sm">
              Войти
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">
              Регистрация
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
