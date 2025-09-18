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

// Получаем базу данных через SQL запросы
const executeQuery = async (query: string): Promise<any> => {
  try {
    const response = await fetch('/api/database/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const saveUserToDB = async (login: string, password: string): Promise<boolean> => {
  try {
    // Проверяем, не существует ли уже такой пользователь
    const checkQuery = `SELECT id FROM users WHERE login = '${login.replace(/'/g, "''")}'`;
    const existingResult = await executeQuery(checkQuery);
    
    if (existingResult.data && existingResult.data.length > 0) {
      console.warn('Пользователь с таким логином уже существует');
      return false;
    }
    
    // Создаем нового пользователя
    const insertQuery = `
      INSERT INTO users (login, password, created_at, updated_at) 
      VALUES (
        '${login.replace(/'/g, "''")}', 
        '${password.replace(/'/g, "''")}', 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      )
    `;
    
    const result = await executeQuery(insertQuery);
    
    if (result.success) {
      console.log('✅ Пользователь сохранен в базу данных:', login);
      return true;
    } else {
      console.error('❌ Ошибка сохранения пользователя:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Ошибка сохранения пользователя:', error);
    return false;
  }
};

export const findUserInDB = async (login: string, password: string): Promise<User | null> => {
  try {
    const query = `
      SELECT id, login, password, created_at, updated_at 
      FROM users 
      WHERE login = '${login.replace(/'/g, "''")}' 
      AND password = '${password.replace(/'/g, "''")}'
    `;
    
    const result = await executeQuery(query);
    
    if (result.success && result.data && result.data.length > 0) {
      return result.data[0] as User;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Ошибка поиска пользователя:', error);
    return null;
  }
};

export const loginUserDB = async (login: string, password: string): Promise<AuthResult> => {
  try {
    const user = await findUserInDB(login, password);
    
    if (user) {
      console.log('✅ Пользователь авторизован:', login);
      return { success: true, user };
    }
    
    return { 
      success: false, 
      error: 'Неверный логин или пароль' 
    };
  } catch (error) {
    console.error('❌ Ошибка авторизации:', error);
    return { 
      success: false, 
      error: 'Произошла ошибка при входе в систему' 
    };
  }
};

export const getAllUsersFromDB = async (): Promise<User[]> => {
  try {
    const query = 'SELECT id, login, created_at, updated_at FROM users ORDER BY created_at DESC';
    const result = await executeQuery(query);
    
    if (result.success && result.data) {
      return result.data as User[];
    }
    
    return [];
  } catch (error) {
    console.error('❌ Ошибка получения пользователей:', error);
    return [];
  }
};