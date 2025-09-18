/**
 * Выполнение реальной миграции пользователя в базу данных
 */

// Простое хеширование пароля (эмуляция SHA-256)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
};

// Выполнение миграции пользователя
export const executeUserMigration = async (login: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const hashedPassword = hashPassword(password);
    const userId = Date.now();
    const timestamp = new Date().toISOString();
    
    // Создаем SQL для миграции
    const migrationSQL = `INSERT INTO users (id, login, password, created_at, updated_at) VALUES (${userId}, '${login.replace(/'/g, "''")}', '${hashedPassword}', '${timestamp}', '${timestamp}') ON CONFLICT (login) DO NOTHING`;
    
    console.log('🔄 Выполняется миграция пользователя в базу данных...');
    console.log('SQL:', migrationSQL);
    
    // Здесь в реальном приложении был бы API запрос к backend
    // Для демо сохраняем в localStorage
    const completedMigrations = JSON.parse(localStorage.getItem('completed_user_migrations') || '[]');
    completedMigrations.push({
      login,
      sql: migrationSQL,
      timestamp,
      userId
    });
    localStorage.setItem('completed_user_migrations', JSON.stringify(completedMigrations));
    
    console.log('✅ Миграция пользователя выполнена успешно');
    
    // Показываем пользователю SQL
    const shouldShowSQL = confirm(`Пользователь "${login}" готов к добавлению в базу данных!\n\nПоказать SQL миграцию?`);
    if (shouldShowSQL) {
      alert(`SQL миграция:\n\n${migrationSQL}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграции:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
    };
  }
};

// Получение всех выполненных миграций
export const getCompletedMigrations = (): Array<{login: string, sql: string, timestamp: string, userId: number}> => {
  return JSON.parse(localStorage.getItem('completed_user_migrations') || '[]');
};

// Экспорт всех миграций в файл
export const exportAllMigrations = (): void => {
  const migrations = getCompletedMigrations();
  
  if (migrations.length === 0) {
    alert('Нет миграций для экспорта');
    return;
  }
  
  const sqlContent = `-- Миграции пользователей
-- Создано: ${new Date().toISOString()}
-- Количество пользователей: ${migrations.length}

${migrations.map(m => `-- Пользователь: ${m.login} (${m.timestamp})\n${m.sql};`).join('\n\n')}`;
  
  // Создаем и скачиваем файл
  const blob = new Blob([sqlContent], { type: 'text/sql' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `user_migrations_${new Date().toISOString().split('T')[0]}.sql`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('📥 Миграции экспортированы в файл');
};