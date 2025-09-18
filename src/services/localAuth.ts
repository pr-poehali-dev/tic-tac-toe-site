/**
 * Локальная система аутентификации (без сервера)
 * Использует localStorage для хранения пользователей
 */

export interface LocalUser {
  id: number;
  login: string;
  password: string; // В реальном приложении должен быть хешированный
  created_at: string;
}

const USERS_KEY = 'local_users';
const CURRENT_USER_KEY = 'currentUser';

// Функция для хеширования пароля (простой вариант для демо)
const hashPassword = (password: string): string => {
  return btoa(password + 'salt123'); // Простое кодирование для демо
};

// Получение всех пользователей из localStorage
const getUsers = (): LocalUser[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Сохранение пользователей в localStorage
const saveUsers = (users: LocalUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Регистрация нового пользователя
export const localRegister = (login: string, password: string): { success: boolean; error?: string; user?: LocalUser } => {
  // Валидация
  if (!login || !password) {
    return { success: false, error: 'Логин и пароль обязательны' };
  }
  
  if (login.length < 3) {
    return { success: false, error: 'Логин должен содержать минимум 3 символа' };
  }
  
  if (password.length < 6) {
    return { success: false, error: 'Пароль должен содержать минимум 6 символов' };
  }

  const users = getUsers();
  
  // Проверяем, существует ли уже пользователь с таким логином
  if (users.find(user => user.login === login)) {
    return { success: false, error: 'Пользователь с таким логином уже существует' };
  }

  // Создаем нового пользователя
  const newUser: LocalUser = {
    id: Date.now(), // Простой способ генерации ID
    login,
    password: hashPassword(password),
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // Возвращаем пользователя без пароля
  const { password: _, ...userWithoutPassword } = newUser;
  return { success: true, user: userWithoutPassword as any };
};

// Вход пользователя
export const localLogin = (login: string, password: string): { success: boolean; error?: string; user?: Omit<LocalUser, 'password'> } => {
  // Валидация
  if (!login || !password) {
    return { success: false, error: 'Логин и пароль обязательны' };
  }

  const users = getUsers();
  const user = users.find(u => u.login === login);

  if (!user) {
    return { success: false, error: 'Неверный логин или пароль' };
  }

  // Проверяем пароль
  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) {
    return { success: false, error: 'Неверный логин или пароль' };
  }

  // Сохраняем текущего пользователя
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

  return { success: true, user: userWithoutPassword };
};

// Выход пользователя
export const localLogout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Получение текущего пользователя
export const getCurrentUser = (): Omit<LocalUser, 'password'> | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Инициализация тестового пользователя
export const initTestUser = (): void => {
  const users = getUsers();
  
  // Создаем тестового пользователя если его нет
  if (!users.find(u => u.login === 'test')) {
    users.push({
      id: 1,
      login: 'test',
      password: hashPassword('test123'),
      created_at: new Date().toISOString()
    });
    saveUsers(users);
  }
};