interface User {
  user: string;
  password: string;
  id: number;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'local_users_db';

export const saveUserToLocalDB = (login: string, password: string): boolean => {
  try {
    // Получаем существующих пользователей
    const existingUsers = getLocalUsers();
    
    // Проверяем, есть ли уже такой пользователь
    const userExists = existingUsers.some(user => user.user === login);
    
    if (userExists) {
      console.warn('Пользователь с таким логином уже существует');
      return false;
    }
    
    // Создаем нового пользователя
    const newUser: User = {
      user: login,
      password: password,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    // Добавляем в массив
    const updatedUsers = [...existingUsers, newUser];
    
    // Сохраняем в localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    console.log('✅ Пользователь сохранен в локальную базу:', login);
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка сохранения пользователя:', error);
    return false;
  }
};

export const getLocalUsers = (): User[] => {
  try {
    const users = localStorage.getItem(LOCAL_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('❌ Ошибка чтения локальной базы:', error);
    return [];
  }
};

export const findUser = (login: string, password: string): User | null => {
  const users = getLocalUsers();
  return users.find(user => user.user === login && user.password === password) || null;
};

export const loginUser = (login: string, password: string): { success: boolean; user?: User; error?: string } => {
  const user = findUser(login, password);
  
  if (user) {
    console.log('✅ Пользователь авторизован:', login);
    return { success: true, user };
  }
  
  return { 
    success: false, 
    error: 'Неверный логин или пароль' 
  };
};

export const clearLocalDB = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  console.log('🗑️ Локальная база очищена');
};