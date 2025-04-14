import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Главный баннер */}
      <div className="bg-gradient-to-r from-primary/80 to-primary pt-16 pb-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Крестики-нолики</h1>
        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
          Классическая игра для двух игроков в современном исполнении. Сыграйте с другом и выясните, кто лучший!
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Link to="/login">
            <Button size="lg" variant="secondary">
              Войти
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg">
              Регистрация
            </Button>
          </Link>
        </div>
      </div>

      {/* Блок с описанием игры */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-3xl mr-2">🎮</span> Простые правила
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Цель игры - поставить три своих символа в ряд по горизонтали, вертикали или диагонали. 
                Первый игрок ставит крестики, второй - нолики.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-3xl mr-2">🏆</span> Соревнуйтесь
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Создайте учетную запись, чтобы отслеживать свои победы и поражения. 
                Соревнуйтесь с друзьями и повышайте свой рейтинг!
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-3xl mr-2">🚀</span> Играйте где угодно
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Приложение работает на всех устройствах - играйте на компьютере, планшете 
                или смартфоне. Начните игру сейчас!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Блок с призывом к действию */}
      <div className="bg-muted py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Создайте учетную запись или войдите, чтобы начать игру прямо сейчас!
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/login">
            <Button variant="outline" size="lg">
              Войти
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg">
              Регистрация
            </Button>
          </Link>
        </div>
      </div>

      {/* Подвал */}
      <footer className="py-8 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2023 Крестики-нолики. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
