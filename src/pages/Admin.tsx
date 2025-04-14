import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin: React.FC = () => {
  const { availableRooms, spectateRoom } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  
  // Проверка на администратора
  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
        <p className="mb-6">У вас нет прав для просмотра этой страницы.</p>
        <Button onClick={() => navigate("/")}>На главную</Button>
      </div>
    );
  }
  
  // Фильтрация комнат по поиску
  const filteredRooms = availableRooms.filter(room => {
    const searchLower = search.toLowerCase();
    return (
      room.id.toLowerCase().includes(searchLower) ||
      room.roomCode.toLowerCase().includes(searchLower) ||
      room.players.some(p => p.username.toLowerCase().includes(searchLower))
    );
  });
  
  // Сортировка: сначала активные, затем по времени последней активности
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    // Сначала сортируем по статусу
    if (a.status === "playing" && b.status !== "playing") return -1;
    if (a.status !== "playing" && b.status === "playing") return 1;
    
    // Затем по времени последней активности
    return b.lastActivity - a.lastActivity;
  });
  
  // Функция для получения статуса комнаты
  const getRoomStatus = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline">Ожидание</Badge>;
      case "playing":
        return <Badge variant="default" className="bg-green-500">Активная</Badge>;
      case "finished":
        return <Badge variant="secondary">Завершена</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };
  
  // Функция для наблюдения за игрой
  const handleSpectate = (roomId: string) => {
    spectateRoom(roomId);
    navigate("/game");
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
      <p className="text-muted-foreground mb-8">Управление игровыми комнатами</p>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Поиск комнат</CardTitle>
          <CardDescription>Найдите комнату по ID, коду или имени игрока</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-bold mb-4">Список игровых комнат ({sortedRooms.length})</h2>
      
      {sortedRooms.length > 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код комнаты</TableHead>
                <TableHead>Игроки</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Создана</TableHead>
                <TableHead>Активность</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">
                    {room.roomCode}
                    <div className="text-xs text-muted-foreground mt-1">ID: {room.id.substring(0, 8)}...</div>
                  </TableCell>
                  <TableCell>
                    {room.players.map((player, idx) => (
                      <div key={player.id} className="text-sm">
                        {player.username} ({player.symbol})
                        {room.currentTurn === player.id && room.status === "playing" && (
                          <span className="ml-2 text-xs text-blue-500">Ходит</span>
                        )}
                      </div>
                    ))}
                    {room.players.length < 2 && (
                      <div className="text-xs text-muted-foreground">Ожидание игрока</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getRoomStatus(room.status)}
                    {room.winner && (
                      <div className="text-xs mt-1">
                        Победитель: <span className="font-medium">{room.winner}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDistanceToNow(room.createdAt, { addSuffix: true, locale: ru })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDistanceToNow(room.lastActivity, { addSuffix: true, locale: ru })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 gap-1"
                      onClick={() => handleSpectate(room.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Наблюдать</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-950 rounded-lg border">
          <p className="text-muted-foreground">Активных игровых комнат не найдено</p>
        </div>
      )}
    </div>
  );
};

export default Admin;