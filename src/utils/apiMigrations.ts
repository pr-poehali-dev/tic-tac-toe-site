// Утилиты для работы с API миграций и пользователей

const FUNC_URLS = {
  migrations: '', // Будет заполнено после деплоя backend/migrations
  users: '', // Будет заполнено после деплоя backend/users
  emailNotifications: '' // Будет заполнено после деплоя backend/email-notifications
};

// Функция для получения URL функций из func2url.json
export const loadFunctionUrls = async () => {
  try {
    const response = await fetch('/backend/func2url.json');
    const data = await response.json();
    
    FUNC_URLS.migrations = data.migrations || '';
    FUNC_URLS.users = data.users || '';
    FUNC_URLS.emailNotifications = data['email-notifications'] || '';
    
    return FUNC_URLS;
  } catch (error) {
    console.error('Ошибка загрузки URL функций:', error);
    return FUNC_URLS;
  }
};

// Автоматическое выполнение миграции через API
export const executeAutomaticMigration = async (migrationSql: string, migrationName: string) => {
  try {
    // Загружаем URL если они не загружены
    if (!FUNC_URLS.migrations) {
      await loadFunctionUrls();
    }

    if (!FUNC_URLS.migrations) {
      throw new Error('URL функции миграций не найден');
    }

    const response = await fetch(FUNC_URLS.migrations, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        migration_sql: migrationSql,
        migration_name: migrationName
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка выполнения миграции');
    }

    return {
      success: true,
      data: data,
      message: data.message
    };

  } catch (error) {
    console.error('Ошибка автоматической миграции:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
};

// Создание пользователя через API
export const createUserAPI = async (login: string, password: string) => {
  try {
    // Загружаем URL если они не загружены
    if (!FUNC_URLS.users) {
      await loadFunctionUrls();
    }

    if (!FUNC_URLS.users) {
      throw new Error('URL функции пользователей не найден');
    }

    const response = await fetch(FUNC_URLS.users, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login: login,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка создания пользователя');
    }

    return {
      success: true,
      user: data.user,
      message: data.message
    };

  } catch (error) {
    console.error('Ошибка создания пользователя через API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
};

// Получение списка пользователей
export const getUsersAPI = async () => {
  try {
    if (!FUNC_URLS.users) {
      await loadFunctionUrls();
    }

    if (!FUNC_URLS.users) {
      throw new Error('URL функции пользователей не найден');
    }

    const response = await fetch(FUNC_URLS.users);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка получения пользователей');
    }

    return {
      success: true,
      users: data.users,
      total: data.total
    };

  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
};

// Отправка email уведомления о регистрации
export const sendEmailNotification = async (userLogin: string, userEmail?: string) => {
  try {
    // Загружаем URL если они не загружены
    if (!FUNC_URLS.emailNotifications) {
      await loadFunctionUrls();
    }

    if (!FUNC_URLS.emailNotifications) {
      console.warn('URL функции email уведомлений не найден - пропускаем отправку');
      return {
        success: false,
        error: 'Email уведомления не настроены'
      };
    }

    const response = await fetch(FUNC_URLS.emailNotifications, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_login: userLogin,
        user_email: userEmail || '',
        notification_type: 'registration'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Ошибка отправки email уведомления:', data.error);
      return {
        success: false,
        error: data.error || 'Ошибка отправки email уведомления'
      };
    }

    return {
      success: true,
      message: data.message
    };

  } catch (error) {
    console.warn('Ошибка отправки email уведомления:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
};

export { FUNC_URLS };