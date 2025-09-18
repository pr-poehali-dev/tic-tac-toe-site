interface User {
  id: number;
  user: string;
  login: string;
  createdAt: string;
  updatedAt?: string;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

// URLs функций из func2url.json
const USER_MIGRATION_URL = 'https://functions.poehali.dev/602f3f95-3655-472f-b651-99024f845176';
const USER_AUTH_URL = 'https://functions.poehali.dev/52577dc2-5723-4642-9a67-beb7cb1fe7c7';

// Регистрация пользователя через PostgreSQL
export const registerUserAPI = async (login: string, password: string): Promise<AuthResult> => {
  try {
    const response = await fetch(USER_MIGRATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login,
        password
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Пользователь зарегистрирован в PostgreSQL:', login);
      return {
        success: true,
        user: data.user,
        message: data.message
      };
    } else {
      console.error('❌ Ошибка регистрации:', data.error);
      return {
        success: false,
        error: data.error || 'Произошла ошибка при регистрации'
      };
    }
  } catch (error) {
    console.error('❌ Сетевая ошибка при регистрации:', error);
    return {
      success: false,
      error: 'Не удалось подключиться к серверу'
    };
  }
};

// Аутентификация пользователя через PostgreSQL
export const loginUserAPI = async (login: string, password: string): Promise<AuthResult> => {
  try {
    const response = await fetch(USER_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login,
        password
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Пользователь авторизован через PostgreSQL:', login);
      return {
        success: true,
        user: data.user,
        message: data.message
      };
    } else {
      console.error('❌ Ошибка авторизации:', data.error);
      return {
        success: false,
        error: data.error || 'Неверный логин или пароль'
      };
    }
  } catch (error) {
    console.error('❌ Сетевая ошибка при авторизации:', error);
    return {
      success: false,
      error: 'Не удалось подключиться к серверу'
    };
  }
};

// Проверка доступности API
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    // Пробуем пустой запрос для проверки OPTIONS
    const response = await fetch(USER_AUTH_URL, {
      method: 'OPTIONS',
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ API недоступно:', error);
    return false;
  }
};