import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Если мы на странице авторизации или регистрации, не показываем хедер
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }
  
  // Получаем инициалы пользователя
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            🎮 Крестики-нолики
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium hover:underline">
              Главная
            </Link>
            {isAuthenticated && (
              <Link to="/game" className="text-sm font-medium hover:underline">
                Играть
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user ? getInitials(user.username) : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium cursor-default">
                  {user?.username}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;