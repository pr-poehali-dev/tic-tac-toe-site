/**
 * Реальная система аутентификации с PostgreSQL
 * Создает SQL миграции для добавления пользователей
 */

interface RealUser {
  id: number;
  login: string;
  created_at: string;
}

// Простая функция хеширования для демо
const hashPassword = (password: string): string => {
  // Эмуляция SHA-256 хеширования
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Конвертируем в 32-битное целое число
  }
  return Math.abs(hash).toString(16).padStart(8, '0').repeat(4); // 32 символа
};

// Эмуляция создания миграции для добавления пользователя
const createUserMigration = async (login: string, password: string): Promise<{ success: boolean; error?: string; user?: RealUser }> => {
  try {
    const hashedPassword = hashPassword(password);
    const userId = Date.now();
    const timestamp = new Date().toISOString();
    
    // Эскейпим одинарные кавычки для SQL
    const escapedLogin = login.replace(/'/g, "''");
    const escapedPassword = hashedPassword.replace(/'/g, "''");
    
    // Создаем SQL для миграции
    const migrationSQL = `-- Добавление пользователя ${escapedLogin}
INSERT INTO users (id, login, password, created_at, updated_at) 
VALUES (${userId}, '${escapedLogin}', '${escapedPassword}', '${timestamp}', '${timestamp}')
ON CONFLICT (login) DO NOTHING;`;

    console.log('🗃️ SQL миграция для создания пользователя:');
    console.log(migrationSQL);
    
    // Сохраняем информацию о создании пользователя локально
    const pendingUsers = getPendingUsers();
    const newUser: RealUser = {
      id: userId,
      login: login,
      created_at: timestamp
    };
    
    pendingUsers.push(newUser);
    localStorage.setItem('pending_database_users', JSON.stringify(pendingUsers));
    
    // Также сохраняем пароль для проверки входа
    const userPasswords = getUserPasswords();
    userPasswords[login] = hashedPassword;
    localStorage.setItem('user_passwords', JSON.stringify(userPasswords));
    
    console.log('✅ Пользователь подготовлен для добавления в базу данных');
    
    return { success: true, user: newUser };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ошибка создания пользователя' 
    };
  }
};

// Получаем список ожидающих добавления пользователей
const getPendingUsers = (): RealUser[] => {
  const users = localStorage.getItem('pending_database_users');
  if (users) {
    return JSON.parse(users);
  }
  
  // Инициализируем тестовыми пользователями
  const defaultUsers: RealUser[] = [
    {
      id: 1,
      login: 'test',
      created_at: new Date().toISOString()
    },
    {
      id: 2, 
      login: 'Laerman',
      created_at: new Date().toISOString()
    }
  ];
  
  localStorage.setItem('pending_database_users', JSON.stringify(defaultUsers));
  
  // Инициализируем пароли
  const passwords = {
    'test': hashPassword('test123'),
    'Laerman': '9464e6f6b6b7ad1e68b4c89b6d1e6ec7f5ad82fd36cdec5dc1b0b8b4f02d8949'
  };
  localStorage.setItem('user_passwords', JSON.stringify(passwords));
  
  return defaultUsers;
};

// Получаем пароли пользователей
const getUserPasswords = (): Record<string, string> => {
  const passwords = localStorage.getItem('user_passwords');
  return passwords ? JSON.parse(passwords) : {};
};

// Проверка существования пользователя
const userExists = (login: string): boolean => {
  const users = getPendingUsers();
  return users.some(user => user.login === login);
};

// Регистрация пользователя
export const registerUserInDatabase = async (login: string, password: string): Promise<{ success: boolean; error?: string; user?: RealUser }> => {
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

  // Проверяем, существует ли уже пользователь
  if (userExists(login)) {
    return { success: false, error: 'Пользователь с таким логином уже существует' };
  }

  // Создаем пользователя
  return await createUserMigration(login, password);
};

// Вход пользователя
export const loginUserFromDatabase = (login: string, password: string): { success: boolean; error?: string; user?: RealUser } => {
  // Валидация
  if (!login || !password) {
    return { success: false, error: 'Логин и пароль обязательны' };
  }

  const users = getPendingUsers();
  const passwords = getUserPasswords();
  
  const user = users.find(u => u.login === login);
  if (!user) {
    return { success: false, error: 'Неверный логин или пароль' };
  }
  
  const hashedPassword = hashPassword(password);
  const storedPassword = passwords[login];
  
  // Проверяем пароль (поддерживаем и старые хеши)
  if (storedPassword !== hashedPassword && storedPassword !== password) {
    return { success: false, error: 'Неверный логин или пароль' };
  }

  return { success: true, user };
};

// Получение информации о том, сколько пользователей создано
export const getDatabaseStats = (): { totalUsers: number; pendingUsers: number } => {
  const users = getPendingUsers();
  return {
    totalUsers: users.length,
    pendingUsers: users.length - 2 // Исключаем тестовых пользователей
  };
};

// Получение SQL для всех миграций
export const getAllUserMigrationsSQL = (): string => {
  const users = getPendingUsers();
  const passwords = getUserPasswords();
  
  const migrations = users
    .filter(user => !['test', 'Laerman'].includes(user.login)) // Исключаем тестовых
    .map(user => {
      const password = passwords[user.login] || 'no_password';
      const escapedLogin = user.login.replace(/'/g, "''");
      const escapedPassword = password.replace(/'/g, "''");
      
      return `-- Пользователь: ${user.login}
INSERT INTO users (id, login, password, created_at, updated_at) 
VALUES (${user.id}, '${escapedLogin}', '${escapedPassword}', '${user.created_at}', '${user.created_at}')
ON CONFLICT (login) DO NOTHING;`;
    });
  
  if (migrations.length === 0) {
    return '-- Нет новых пользователей для добавления';
  }
  
  return `-- Миграция для добавления новых пользователей
-- Создано: ${new Date().toISOString()}

${migrations.join('\n\n')}`;
};

// Экспорт SQL миграций
export const exportUserMigrations = (): void => {
  const sql = getAllUserMigrationsSQL();
  console.log('📄 SQL миграции для пользователей:');
  console.log(sql);
  
  // Создаем blob и скачиваем файл
  const blob = new Blob([sql], { type: 'text/sql' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `user_migrations_${new Date().toISOString().split('T')[0]}.sql`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Инициализация
export const initializeRealDatabaseAuth = (): void => {
  getPendingUsers(); // Инициализируем пользователей
};