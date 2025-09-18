import React, { createContext, useContext, useState, useEffect } from "react";

// Типы данных пользователя
interface User {
  id: number;
  username: string;
  login: string;
  role: 'user' | 'admin';
  created_at?: string;
}

interface AuthCredentials {
  login: string;
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

  const authUrl = 'https://functions.poehali.dev/5d68be3f-eff8-48bb-bde1-620d59e59f34';

  // Проверка сохраненного пользователя
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Создаем пользователя с нужной структурой
        const user: User = {
          id: parsedUser.id,
          username: parsedUser.login,
          login: parsedUser.login,
          role: parsedUser.login === 'admin' ? 'admin' : 'user',
          created_at: parsedUser.created_at
        };
        setUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  // Вход через API
  const login = async (credentials: AuthCredentials): Promise<boolean> => {
    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          login: credentials.login,
          password: credentials.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Создаем пользователя с нужной структурой
        const user: User = {
          id: data.user.id,
          username: data.user.login,
          login: data.user.login,
          role: data.user.login === 'admin' ? 'admin' : 'user',
          created_at: data.user.created_at
        };

        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка входа:', error);
      return false;
    }
  };

  // Регистрация через API
  const register = async (userData: AuthCredentials): Promise<boolean> => {
    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          login: userData.login,
          password: userData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return true; // Регистрация прошла успешно, но не входим автоматически
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
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