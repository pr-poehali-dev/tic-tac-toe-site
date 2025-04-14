import React, { createContext, useContext, useState, useEffect } from "react";

// Тип для пользователя
interface User {
  username: string;
}

// Тип для контекста аутентификации
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string) => void;
  logout: () => void;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
};

// Провайдер аутентификации
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Проверяем, есть ли сохраненный пользователь при загрузке
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Функция для входа
  const login = (username: string) => {
    const user = { username };
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Функция для выхода
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    isAuthenticated: user !== null,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
