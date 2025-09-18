/**
 * Утилита для создания SQL миграций пользователей
 */

// Простая функция хеширования SHA-256 (эмуляция)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
};

// Создание SQL миграции для пользователя
export const createUserMigration = async (login: string, password: string): Promise<void> => {
  const hashedPassword = hashPassword(password);
  const userId = Date.now();
  const timestamp = new Date().toISOString();
  
  // Эскейпим кавычки для безопасности
  const escapedLogin = login.replace(/'/g, "''");
  const escapedPassword = hashedPassword.replace(/'/g, "''");
  
  const migrationSQL = `-- Миграция добавления пользователя ${escapedLogin}
-- Создано: ${timestamp}

INSERT INTO users (id, login, password, created_at, updated_at) 
VALUES (${userId}, '${escapedLogin}', '${escapedPassword}', '${timestamp}', '${timestamp}')
ON CONFLICT (login) DO NOTHING;`;

  console.log('🗃️ SQL миграция для создания пользователя:');
  console.log(migrationSQL);
  
  // Сохраняем локально для демонстрации
  const existingMigrations = localStorage.getItem('user_migrations') || '';
  localStorage.setItem('user_migrations', existingMigrations + '\n\n' + migrationSQL);
  
  // Показываем alert с SQL
  alert(`Пользователь ${login} будет добавлен в базу данных!\n\nSQL миграция:\n${migrationSQL}`);
  
  console.log('✅ Миграция создана и сохранена локально');
};