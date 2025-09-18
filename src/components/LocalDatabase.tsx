import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLocalUsers, clearLocalDB } from '@/utils/localDatabase';
import { Trash2, Users, Eye } from 'lucide-react';

const LocalDatabase: React.FC = () => {
  const [users, setUsers] = React.useState(getLocalUsers());
  const [showPasswords, setShowPasswords] = React.useState(false);

  const refreshUsers = () => {
    setUsers(getLocalUsers());
  };

  const handleClearDB = () => {
    if (confirm('Вы уверены, что хотите очистить всю локальную базу данных?')) {
      clearLocalDB();
      refreshUsers();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle>Локальная база данных</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowPasswords(!showPasswords)}>
              <Eye className="h-4 w-4 mr-1" />
              {showPasswords ? 'Скрыть пароли' : 'Показать пароли'}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshUsers}>
              Обновить
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearDB}>
              <Trash2 className="h-4 w-4 mr-1" />
              Очистить
            </Button>
          </div>
        </div>
        <CardDescription>
          Всего пользователей: {users.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>База данных пуста</p>
            <p className="text-sm">Зарегистрируйте первого пользователя</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">Логин</th>
                  <th className="text-left p-3 font-medium">Пароль</th>
                  <th className="text-left p-3 font-medium">Создан</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-mono text-sm">{user.id}</td>
                    <td className="p-3 font-medium">{user.user}</td>
                    <td className="p-3 font-mono text-sm">
                      {showPasswords ? user.password : '••••••••'}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocalDatabase;