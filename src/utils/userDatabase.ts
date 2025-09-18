interface User {
  id: number;
  login: string;
  password: string;
  created_at: string;
  updated_at: string;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Сохранение пользователя в базу данных
export const saveUserToDB = async (login: string, password: string): Promise<boolean> => {
  try {
    // Экранируем кавычки в логине и пароле
    const escapedLogin = login.replace(/'/g, "''");
    const escapedPassword = password.replace(/'/g, "''");
    
    // SQL для вставки нового пользователя
    const insertSQL = `
      INSERT INTO users (login, password, created_at, updated_at) 
      VALUES ('${escapedLogin}', '${escapedPassword}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    console.log('📤 Сохраняем пользователя в БД:', login);
    console.log('SQL:', insertSQL);
    
    // Для демонстрации - логируем SQL, но не выполняем
    // В будущем здесь будет реальное выполнение через API
    
    // Временно возвращаем true
    console.log('✅ Пользователь сохранен в БД (mock)');
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка сохранения пользователя в БД:', error);
    return false;
  }
};

// Поиск пользователя в базе данных
export const findUserInDB = async (login: string, password: string): Promise<User | null> => {
  try {
    // Экранируем кавычки
    const escapedLogin = login.replace(/'/g, "''");
    const escapedPassword = password.replace(/'/g, "''");
    
    // SQL для поиска пользователя
    const selectSQL = `
      SELECT id, login, password, created_at, updated_at 
      FROM users 
      WHERE login = '${escapedLogin}' AND password = '${escapedPassword}'
    `;
    
    console.log('🔍 Ищем пользователя в БД:', login);
    console.log('SQL:', selectSQL);
    
    // Временно возвращаем null (пользователь не найден)
    console.log('❌ Пользователь не найден в БД (mock)');
    return null;
    
  } catch (error) {
    console.error('❌ Ошибка поиска пользователя в БД:', error);
    return null;
  }
};

// Авторизация пользователя через базу данных
export const loginUserDB = async (login: string, password: string): Promise<AuthResult> => {
  try {
    const user = await findUserInDB(login, password);
    
    if (user) {
      console.log('✅ Пользователь авторизован через БД:', login);
      return { success: true, user };
    }
    
    return { 
      success: false, 
      error: 'Неверный логин или пароль' 
    };
  } catch (error) {
    console.error('❌ Ошибка авторизации через БД:', error);
    return { 
      success: false, 
      error: 'Произошла ошибка при входе в систему' 
    };
  }
};

// Получение всех пользователей из базы данных
export const getAllUsersFromDB = async (): Promise<User[]> => {
  try {
    const selectSQL = 'SELECT id, login, created_at, updated_at FROM users ORDER BY created_at DESC';
    
    console.log('📋 Получаем всех пользователей из БД');
    console.log('SQL:', selectSQL);
    
    // Временно возвращаем пустой массив
    console.log('📄 Пользователи получены (mock): 0');
    return [];
    
  } catch (error) {
    console.error('❌ Ошибка получения пользователей из БД:', error);
    return [];
  }
};