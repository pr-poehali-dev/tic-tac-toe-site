import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import BubbleBackground from "@/components/BubbleBackground";
import UnderwaterIcon from "@/components/UnderwaterIcon";
import SimpleAuthForm from "@/components/Auth/SimpleAuthForm";

const Index: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleAuthSuccess = (userData: any) => {
    setShowAuthForm(false);
    // Пользователь автоматически будет обновлен через AuthContext
  };

  // Если показываем форму аутентификации, рендерим только её
  if (showAuthForm) {
    return <SimpleAuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <div className="fixed inset-0 z-0">
        <img 
          src="https://cdn.poehali.dev/projects/17336903318390/bucket/anime-cat-bg.jpg"
          alt="Anime cat background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      <div className="container max-w-5xl py-16 text-center relative z-10">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2 flex items-center justify-center">
            <UnderwaterIcon emoji="🐋" size="lg" delay={1} className="mr-4" />
            <span className="wave-text">SVOIKIT</span>
            <UnderwaterIcon emoji="🎮" size="lg" delay={2} className="ml-4" />
          </h1>
          <p className="text-2xl text-ocean-700 dark:text-ocean-100 italic">
            свой кит - твои игры
          </p>
        </div>
        
        <div className="underwater-card p-8 mb-12 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center justify-center">
            <UnderwaterIcon emoji="🦑" delay={0.5} className="mr-2" />
            <span>Погрузись в мир игр</span>
            <UnderwaterIcon emoji="🐙" delay={1.5} className="ml-2" />
          </h2>
          
          <p className="mb-6">
            Играйте с друзьями в увлекательные игры или присоединяйтесь к открытым играм других игроков в нашем подводном мире развлечений!
          </p>
          
          {isAuthenticated ? (
            <Link to="/tic-tac-toe">
              <Button size="lg" className="w-full ocean-button">
                Начать игру
              </Button>
            </Link>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Войдите или зарегистрируйтесь, чтобы начать игру
              </p>
              <Button 
                onClick={() => setShowAuthForm(true)}
                className="w-full coral-button"
              >
                Вход / Регистрация
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="underwater-card p-6">
            <UnderwaterIcon emoji="🐠" size="md" delay={0.2} className="mb-3" />
            <h3 className="text-xl font-bold mb-2">Поиск игры</h3>
            <p className="text-muted-foreground mb-2">
              Погрузитесь в пучину игр других игроков
            </p>
          </div>
          
          <div className="underwater-card p-6">
            <UnderwaterIcon emoji="🐡" size="md" delay={0.7} className="mb-3" />
            <h3 className="text-xl font-bold mb-2">Создание игры</h3>
            <p className="text-muted-foreground mb-2">
              Создавайте свои подводные приключения
            </p>
          </div>
          
          <div className="underwater-card p-6">
            <UnderwaterIcon emoji="🦈" size="md" delay={1.2} className="mb-3" />
            <h3 className="text-xl font-bold mb-2">Онлайн-игроки</h3>
            <p className="text-muted-foreground mb-2">
              Плавайте в океане игр с другими игроками
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;