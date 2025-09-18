import React, { useState, useEffect } from 'react';
import SimpleAuthForm from './Auth/SimpleAuthForm';
import UserProfile from './UserProfile';

interface User {
  id: number;
  login: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

const AuthWrapper: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем сохраненного пользователя при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Ошибка при загрузке сохраненного пользователя:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (user: User) => {
    console.log('✅ Пользователь успешно авторизован:', user);
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    console.log('👋 Пользователь вышел из системы');
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Показываем загрузку пока проверяем сохраненного пользователя
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Если пользователь авторизован - показываем профиль
  if (currentUser) {
    return <UserProfile user={currentUser} onLogout={handleLogout} />;
  }

  // Если не авторизован - показываем форму входа/регистрации
  return <SimpleAuthForm onSuccess={handleAuthSuccess} />;
};

export default AuthWrapper;