import React, { createContext, useContext, useState, useEffect } from "react";
import { localLogin, localRegister, localLogout, getCurrentUser, initTestUser } from "@/services/localAuth";

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

  // Инициализация и проверка сохраненного пользователя
  useEffect(() => {
    // Инициализируем тестового пользователя
    initTestUser();
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Создаем пользователя с нужной структурой
      const user: User = {
        id: currentUser.id,
        username: currentUser.login,
        login: currentUser.login,
        role: currentUser.login === 'admin' ? 'admin' : 'user',
        created_at: currentUser.created_at
      };
      setUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  // Вход через локальную систему
  const login = async (credentials: AuthCredentials): Promise<boolean> => {
    const result = localLogin(credentials.login, credentials.password);
    
    if (result.success && result.user) {
      // Создаем пользователя с нужной структурой
      const user: User = {
        id: result.user.id,
        username: result.user.login,
        login: result.user.login,
        role: result.user.login === 'admin' ? 'admin' : 'user',
        created_at: result.user.created_at
      };

      setUser(user);
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  // Регистрация через локальную систему
  const register = async (userData: AuthCredentials): Promise<boolean> => {
    const result = localRegister(userData.login, userData.password);
    return result.success;
  };

  const logout = () => {
    localLogout();
    setUser(null);
    setIsAuthenticated(false);
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