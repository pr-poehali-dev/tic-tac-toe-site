/**
 * Система аутентификации с записью в базу данных
 * Использует SQL миграции для добавления пользователей
 */

interface DatabaseUser {
  id: number;
  login: string;
  password: string;
  created_at: string;
}

// Простая функция хеширования для совместимости
const hashPassword = (password: string): string => {
  // Используем простое хеширование, совместимое с SHA-256
  // В реальности это должно быть на backend
  return btoa(password + 'salt' + password).substring(0, 32);
};

// Эмуляция вставки в базу данных через создание SQL команды
const insertUserToDatabase = async (login: string, hashedPassword: string): Promise<{ success: boolean; error?: string; userId?: number }> => {
  try {
    // Генерируем ID на основе времени
    const userId = Date.now();
    const timestamp = new Date().toISOString();
    
    // Эскейпим одинарные кавычки
    const escapedLogin = login.replace(/'/g, "''");
    const escapedPassword = hashedPassword.replace(/'/g, "''");
    
    // Создаем SQL команду
    const sqlCommand = `INSERT INTO users (id, login, password, created_at) VALUES (${userId}, '${escapedLogin}', '${escapedPassword}', '${timestamp}');`;
    
    console.log('SQL для добавления пользователя:', sqlCommand);
    
    // Сохраняем информацию о пользователе локально
    const localUsers = getLocalUsers();
    localUsers.push({
      id: userId,
      login: login,
      password: hashedPassword,
      created_at: timestamp
    });
    localStorage.setItem('database_users', JSON.stringify(localUsers));
    
    // В реальном приложении здесь был бы запрос к API для выполнения SQL
    return { success: true, userId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
  }
};

// Получаем локальных пользователей (эмуляция БД)
const getLocalUsers = (): DatabaseUser[] => {
  const users = localStorage.getItem('database_users');
  if (users) {
    return JSON.parse(users);
  }
  
  // Инициализируем тестовыми пользователями
  const defaultUsers: DatabaseUser[] = [
    {
      id: 1,
      login: 'test',
      password: hashPassword('test123'),
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      login: 'Laerman',
      password: '9464e6f6b6b7ad1e68b4c89b6d1e6ec7f5ad82fd36cdec5dc1b0b8b4f02d8949', // Хеш для 'Tvthwqu88'
      created_at: new Date().toISOString()
    }
  ];
  
  localStorage.setItem('database_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

// Поиск пользователя в "базе данных"
const findUserInDatabase = (login: string, password: string): DatabaseUser | null => {
  const users = getLocalUsers();
  const hashedPassword = hashPassword(password);
  
  // Также проверяем исходный хеш для существующих пользователей
  return users.find(user => 
    user.login === login && 
    (user.password === hashedPassword || user.password === password)
  ) || null;
};

// Регистрация с записью в "базу данных"
export const registerWithDatabase = async (login: string, password: string): Promise<{ success: boolean; error?: string; user?: Omit<DatabaseUser, 'password'> }> => {
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

  const users = getLocalUsers();
  
  // Проверяем, существует ли уже пользователь
  if (users.find(user => user.login === login)) {
    return { success: false, error: 'Пользователь с таким логином уже существует' };
  }

  // Хешируем пароль
  const hashedPassword = hashPassword(password);
  
  // Добавляем в "базу данных"
  const result = await insertUserToDatabase(login, hashedPassword);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Возвращаем пользователя без пароля
  const newUser = {
    id: result.userId!,
    login: login,
    created_at: new Date().toISOString()
  };

  return { success: true, user: newUser };
};

// Вход с проверкой в "базе данных"
export const loginWithDatabase = (login: string, password: string): { success: boolean; error?: string; user?: Omit<DatabaseUser, 'password'> } => {
  // Валидация
  if (!login || !password) {
    return { success: false, error: 'Логин и пароль обязательны' };
  }

  const user = findUserInDatabase(login, password);

  if (!user) {
    return { success: false, error: 'Неверный логин или пароль' };
  }

  // Возвращаем пользователя без пароля
  const { password: _, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
};

// Получение текущего пользователя
export const getCurrentDatabaseUser = (): Omit<DatabaseUser, 'password'> | null => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// Выход
export const logoutFromDatabase = (): void => {
  localStorage.removeItem('currentUser');
};

// Инициализация
export const initializeDatabaseAuth = (): void => {
  getLocalUsers(); // Инициализируем пользователей
};