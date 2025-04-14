/**
 * Типы для аутентификации пользователей
 */

export type UserRole = 'user' | 'admin';

/**
 * Тип пользователя
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

/**
 * Данные для авторизации
 */
export interface AuthCredentials {
  username: string;
  password: string;
}

/**
 * Тип для контекста авторизации
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (userData: AuthCredentials) => Promise<boolean>;
  logout: () => void;
}
