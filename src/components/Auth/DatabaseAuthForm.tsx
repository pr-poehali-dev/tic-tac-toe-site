import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2, User, Lock, Database } from 'lucide-react';
import { registerWithDatabase, loginWithDatabase } from '@/services/databaseAuth';

interface DatabaseAuthFormProps {
  onSuccess: (user: any) => void;
}

const DatabaseAuthForm: React.FC<DatabaseAuthFormProps> = ({ onSuccess }) => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    console.log('Попытка входа:', loginData.login);

    try {
      const result = loginWithDatabase(loginData.login, loginData.password);
      
      if (result.success && result.user) {
        console.log('Вход успешен:', result.user);
        setSuccess('Вход выполнен успешно!');
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        onSuccess(result.user);
      } else {
        console.log('Ошибка входа:', result.error);
        setError(result.error || 'Произошла ошибка при входе');
      }
    } catch (error) {
      console.error('Исключение при входе:', error);
      setError('Произошла ошибка при входе');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    console.log('Попытка регистрации:', registerData.login);

    // Проверяем совпадение паролей
    if (registerData.password !== registerData.confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerWithDatabase(registerData.login, registerData.password);
      
      if (result.success) {
        console.log('Регистрация успешна:', result.user);
        setSuccess('Регистрация прошла успешно! Теперь можете войти в систему.');
        setRegisterData({
          login: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        console.log('Ошибка регистрации:', result.error);
        setError(result.error || 'Произошла ошибка при регистрации');
      }
    } catch (error) {
      console.error('Исключение при регистрации:', error);
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
              <strong>Данные сохраняются в базу PostgreSQL</strong><br />
              Тестовые аккаунты:<br />
              test / test123<br />
              Laerman / Tvthwqu88
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

export default DatabaseAuthForm;