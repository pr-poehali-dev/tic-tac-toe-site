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

  const authUrl = 'https://functions.poehali.dev/52577dc2-5723-4642-9a67-beb7cb1fe7c7';

  // Инициализация и проверка сохраненного пользователя
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const isAuthStored = localStorage.getItem('isAuthenticated');
    
    if (storedUser && isAuthStored === 'true') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('AuthContext: Restored user from localStorage:', parsedUser);
      } catch (error) {
        console.error('AuthContext: Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    }
  }, []);

  // Вход через бэкенд API
  const login = async (credentials: AuthCredentials): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting backend login with:', credentials);
      
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });

      console.log('AuthContext: Backend response status:', response.status);
      const data = await response.json();
      console.log('AuthContext: Backend response data:', data);

      if (response.ok && data.success && data.user) {
        // Создаем пользователя с нужной структурой
        const user: User = {
          id: data.user.id,
          username: data.user.login,
          login: data.user.login,
          role: data.user.login === 'Laerman' ? 'admin' : 'user',
          created_at: data.user.createdAt
        };

        setUser(user);
        setIsAuthenticated(true);
        
        // Сохраняем в localStorage для сессии
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        
        console.log('AuthContext: Login successful, user set:', user);
        return true;
      }
      
      console.log('AuthContext: Login failed:', data.error || 'Unknown error');
      return false;
      
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return false;
    }
  };

  // Регистрация через бэкенд API (пока не реализована)
  const register = async (userData: AuthCredentials): Promise<boolean> => {
    console.log('Register not implemented yet:', userData);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    setUser(null);
    setIsAuthenticated(false);
    console.log('AuthContext: User logged out');
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