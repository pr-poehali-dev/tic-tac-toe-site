import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Database, 
  CheckCircle, 
  XCircle,
  Trash2,
  Settings
} from 'lucide-react';
import { loadFunctionUrls, FUNC_URLS } from '@/utils/apiMigrations';

interface User {
  id: number;
  login: string;
  created_at: string;
  is_active: boolean;
}

interface Migration {
  id: number;
  name: string;
  sql_hash: string;
  executed_at: string;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Форма создания пользователя
  const [newUser, setNewUser] = useState({ login: '', password: '' });
  
  // Форма миграции
  const [migrationSql, setMigrationSql] = useState('');
  const [migrationName, setMigrationName] = useState('');

  // URLs функций будут загружены автоматически

  // Загрузка пользователей
  const loadUsers = async () => {
    try {
      setLoading(true);
      await loadFunctionUrls(); // Загружаем URLs
      
      const response = await fetch(FUNC_URLS.users);
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Ошибка загрузки пользователей');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  // Создание пользователя
  const createUser = async () => {
    if (!newUser.login.trim() || !newUser.password.trim()) {
      setError('Заполните все поля');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(FUNC_URLS.users, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Пользователь ${newUser.login} создан`);
        setNewUser({ login: '', password: '' });
        loadUsers();
      } else {
        setError(data.error || 'Ошибка создания пользователя');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  // Переключение активности пользователя
  const toggleUserActive = async (userId: number, isActive: boolean) => {
    try {
      setLoading(true);
      const response = await fetch(FUNC_URLS.users, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_active: !isActive })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        loadUsers();
      } else {
        setError(data.error || 'Ошибка обновления пользователя');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  // Удаление пользователя
  const deleteUser = async (userId: number, login: string) => {
    if (!window.confirm(`Удалить пользователя ${login}?`)) return;
    
    try {
      setLoading(true);
      const response = await fetch(FUNC_URLS.users, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        loadUsers();
      } else {
        setError(data.error || 'Ошибка удаления пользователя');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  // Выполнение миграции
  const executeMigration = async () => {
    if (!migrationSql.trim()) {
      setError('Введите SQL код миграции');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(FUNC_URLS.migrations, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          migration_sql: migrationSql,
          migration_name: migrationName || 'manual_migration'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Миграция выполнена: ${data.message}`);
        setMigrationSql('');
        setMigrationName('');
      } else {
        setError(data.error || 'Ошибка выполнения миграции');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Очистка сообщений
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Settings className="inline-block mr-2" />
            Административная панель
          </h1>
          <p className="text-gray-600">Управление пользователями и базой данных</p>
        </div>

        {/* Сообщения */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              База данных
            </TabsTrigger>
          </TabsList>

          {/* Управление пользователями */}
          <TabsContent value="users" className="space-y-6">
            {/* Создание пользователя */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Создать пользователя
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="login">Логин</Label>
                    <Input
                      id="login"
                      value={newUser.login}
                      onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
                      placeholder="Введите логин"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Введите пароль"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={createUser} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Создание...' : 'Создать'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Список пользователей */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Список пользователей ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-center py-4">Загрузка...</p>}
                
                {!loading && users.length === 0 && (
                  <p className="text-center py-8 text-gray-500">Пользователи не найдены</p>
                )}

                <div className="space-y-3">
                  {users.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{user.login}</p>
                          <p className="text-sm text-gray-500">
                            ID: {user.id} • Создан: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant={user.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleUserActive(user.id, user.is_active)}
                          disabled={loading}
                        >
                          {user.is_active ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Деактивировать
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Активировать
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(user.id, user.login)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Управление базой данных */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Выполнить SQL миграцию
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="migrationName">Название миграции (необязательно)</Label>
                  <Input
                    id="migrationName"
                    value={migrationName}
                    onChange={(e) => setMigrationName(e.target.value)}
                    placeholder="create_users_table"
                  />
                </div>
                
                <div>
                  <Label htmlFor="migrationSql">SQL код</Label>
                  <textarea
                    id="migrationSql"
                    value={migrationSql}
                    onChange={(e) => setMigrationSql(e.target.value)}
                    placeholder="CREATE TABLE example (id SERIAL PRIMARY KEY, name VARCHAR(100));"
                    className="w-full h-40 p-3 border rounded-md font-mono text-sm"
                  />
                </div>
                
                <Button 
                  onClick={executeMigration} 
                  disabled={loading || !migrationSql.trim()}
                  className="w-full"
                >
                  {loading ? 'Выполнение...' : 'Выполнить миграцию'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;