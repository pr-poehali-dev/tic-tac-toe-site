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

  // Простая система пользователей
  const getUsers = () => {
    const users = localStorage.getItem('simple_users');
    return users ? JSON.parse(users) : [
      { id: 1, login: 'test', password: 'test123', created_at: new Date().toISOString() }
    ];
  };

  const saveUsers = (users: any[]) => {
    localStorage.setItem('simple_users', JSON.stringify(users));
  };

  // Инициализация и проверка сохраненного пользователя
  useEffect(() => {
    // Инициализируем тестового пользователя
    const users = getUsers();
    saveUsers(users);
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const parsedUser = JSON.parse(currentUser);
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
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Вход через простую систему
  const login = async (credentials: AuthCredentials): Promise<boolean> => {
    console.log('AuthContext login attempt:', credentials);
    
    const users = getUsers();
    const foundUser = users.find((u: any) => u.login === credentials.login && u.password === credentials.password);

    if (foundUser) {
      // Создаем пользователя с нужной структурой
      const user: User = {
        id: foundUser.id,
        username: foundUser.login,
        login: foundUser.login,
        role: foundUser.login === 'admin' ? 'admin' : 'user',
        created_at: foundUser.created_at
      };

      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      console.log('Login successful, user set:', user);
      return true;
    }
    
    console.log('Login failed');
    return false;
  };

  // Регистрация через простую систему
  const register = async (userData: AuthCredentials): Promise<boolean> => {
    console.log('AuthContext register attempt:', userData);
    
    // Валидация
    if (userData.login.length < 3) return false;
    if (userData.password.length < 6) return false;
    
    const users = getUsers();
    
    // Проверяем, существует ли уже пользователь
    if (users.find((u: any) => u.login === userData.login)) {
      return false;
    }

    // Создаем нового пользователя
    const newUser = {
      id: Date.now(),
      login: userData.login,
      password: userData.password,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    
    console.log('Registration successful');
    return true;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsAuthenticated(false);
    console.log('User logged out');
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