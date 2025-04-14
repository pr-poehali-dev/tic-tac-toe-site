import React, { createContext, useContext, useState, useEffect } from "react";

// Типы данных пользователя
interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin'; // Добавлен тип роли
}

interface AuthCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (userData: AuthCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Имитация проверки сохраненного токена
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Имитация API аутентификации
  const login = async (credentials: AuthCredentials): Promise<boolean> => {
    // Для тестирования: имитация входа как администратор с особыми учетными данными
    const isAdmin = credentials.username === "admin" && credentials.password === "admin123";
    
    // Для примера: успешная авторизация любыми данными
    const user = {
      id: "user_" + Math.random().toString(36).substring(2, 10),
      username: credentials.username,
      email: `${credentials.username.toLowerCase()}@example.com`,
      role: isAdmin ? 'admin' as const : 'user' as const
    };

    // Сохраняем пользователя
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(user));
    
    return true;
  };

  const register = async (userData: AuthCredentials): Promise<boolean> => {
    // Для примера: успешная регистрация любыми данными
    const user = {
      id: "user_" + Math.random().toString(36).substring(2, 10),
      username: userData.username,
      email: `${userData.username.toLowerCase()}@example.com`,
      role: 'user' as const
    };

    // Сохраняем пользователя
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(user));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
