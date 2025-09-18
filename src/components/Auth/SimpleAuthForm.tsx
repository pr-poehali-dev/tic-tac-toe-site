import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2, User, Lock, Database } from 'lucide-react';
import { executeUserMigration } from '@/utils/executeUserMigration';
import { executeAutomaticMigration, createUserAPI, sendEmailNotification } from '@/utils/apiMigrations';

interface SimpleAuthFormProps {
  onSuccess: (user: any) => void;
}

const SimpleAuthForm: React.FC<SimpleAuthFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Состояние для формы входа
  const [loginData, setLoginData] = useState({
    login: '',
    password: ''
  });
  
  // Состояние для формы регистрации
  const [registerData, setRegisterData] = useState({
    login: '',
    password: '',
    confirmPassword: ''
  });
  
  // Настройка автоматических миграций
  const [useAutoMigration, setUseAutoMigration] = useState(true);

  // Простая система пользователей
  const getUsers = () => {
    const users = localStorage.getItem('simple_users');
    return users ? JSON.parse(users) : [
      { id: 1, login: 'test', password: 'test123', created_at: new Date().toISOString() }
    ];
  };

  const saveUsers = (users: any[]) => {
    localStorage.setItem('simple_users', JSON.stringify(users));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    console.log('Attempting login with:', loginData.login, loginData.password);

    try {
      const users = getUsers();
      const user = users.find((u: any) => u.login === loginData.login && u.password === loginData.password);

      if (user) {
        console.log('Login successful');
        setSuccess('Вход выполнен успешно!');
        localStorage.setItem('currentUser', JSON.stringify(user));
        onSuccess(user);
      } else {
        setError('Неверный логин или пароль');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Произошла ошибка при входе');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    console.log('Attempting registration with:', registerData.login, registerData.password);

    // Проверяем совпадение паролей
    if (registerData.password !== registerData.confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    // Валидация
    if (registerData.login.length < 3) {
      setError('Логин должен содержать минимум 3 символа');
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setIsLoading(false);
      return;
    }

    try {
      const users = getUsers();
      
      // Проверяем, существует ли уже пользователь
      if (users.find((u: any) => u.login === registerData.login)) {
        setError('Пользователь с таким логином уже существует');
        setIsLoading(false);
        return;
      }

      let migrationResult;
      
      if (useAutoMigration) {
        // Пытаемся выполнить автоматическую миграцию через API
        const localMigration = await executeUserMigration(registerData.login, registerData.password);
        if (localMigration.success && localMigration.migrationSql) {
          migrationResult = await executeAutomaticMigration(
            localMigration.migrationSql, 
            `create_user_${registerData.login}_${Date.now()}`
          );
          
          if (migrationResult.success) {
            // Также создаем пользователя через API
            const apiResult = await createUserAPI(registerData.login, registerData.password);
            if (!apiResult.success) {
              console.warn('API создание не удалось, но миграция выполнена:', apiResult.error);
            }
          }
        } else {
          migrationResult = { success: false, error: 'Ошибка создания локальной миграции' };
        }
      } else {
        // Выполняем только локальную миграцию как раньше
        migrationResult = await executeUserMigration(registerData.login, registerData.password);
      }
      
      if (!migrationResult.success) {
        setError(`Ошибка создания миграции: ${migrationResult.error}`);
        setIsLoading(false);
        return;
      }

      // Создаем нового пользователя локально
      const newUser = {
        id: Date.now(),
        login: registerData.login,
        password: registerData.password,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);

      // Отправляем email уведомление администратору (не блокируем регистрацию при ошибке)
      try {
        const emailResult = await sendEmailNotification(registerData.login);
        if (emailResult.success) {
          console.log('Email уведомление отправлено:', emailResult.message);
        } else {
          console.warn('Email уведомление не отправлено:', emailResult.error);
        }
      } catch (emailError) {
        console.warn('Ошибка отправки email уведомления:', emailError);
      }

      setSuccess('Регистрация прошла успешно! SQL миграция создана. Администратор получил уведомление. Теперь можете войти в систему.');
      setRegisterData({
        login: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Registration error:', error);
      setError('Произошла ошибка при регистрации');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 to-coral-50 dark:from-ocean-950 dark:to-coral-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
            <Database className="mr-2 h-6 w-6 text-blue-600" />
            Добро пожаловать
          </CardTitle>
          <CardDescription>
            Войдите в аккаунт или создайте новый
          </CardDescription>
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              <strong>🗃️ Данные сохраняются в PostgreSQL</strong><br />
              Тестовый аккаунт: test / test123<br />
              При регистрации создается SQL миграция
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <AlertDescription className="text-green-700 dark:text-green-300">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Логин</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Введите логин"
                      value={loginData.login}
                      onChange={(e) => setLoginData({...loginData, login: e.target.value})}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Введите пароль"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full ocean-button" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Вход...' : 'Войти'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Логин</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Минимум 3 символа"
                      value={registerData.login}
                      onChange={(e) => setRegisterData({...registerData, login: e.target.value})}
                      className="pl-10"
                      required
                      minLength={3}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      className="pl-10"
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Подтвердите пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Повторите пароль"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Настройки миграции */}
                <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Настройки базы данных</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-migration"
                      checked={useAutoMigration}
                      onChange={(e) => setUseAutoMigration(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="auto-migration" className="text-sm">
                      Автоматически выполнять миграции через API
                    </Label>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {useAutoMigration 
                      ? "✅ Пользователь будет добавлен в PostgreSQL базу данных автоматически"
                      : "⚠️ Будет создан только SQL код - нужно выполнить миграцию вручную"
                    }
                  </p>
                </div>

                <Button type="submit" className="w-full coral-button" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleAuthForm;