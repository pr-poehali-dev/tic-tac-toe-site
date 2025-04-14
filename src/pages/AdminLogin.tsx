import React from "react";
import { useNavigate } from "react-router-dom";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface LoginFormValues {
  username: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const success = await login(values);
      
      if (success) {
        // Проверяем, является ли пользователь администратором
        const storedUser = localStorage.getItem("user");
        let isAdmin = false;
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            isAdmin = parsedUser.role === 'admin';
          } catch (error) {
            // Игнорируем ошибку парсинга
          }
        }
        
        if (isAdmin) {
          toast({
            title: "Успешный вход",
            description: "Добро пожаловать в панель администратора",
          });
          navigate("/admin", { replace: true });
        } else {
          toast({
            title: "Доступ запрещен",
            description: "У вас нет прав администратора",
            variant: "destructive",
          });
          // Выполняем выход, т.к. пользователь не админ
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        }
      } else {
        toast({
          title: "Ошибка входа",
          description: "Неверные учетные данные",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при входе в систему",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContainer
      title="Вход для администратора"
      description="Введите учетные данные администратора"
      footerText="Вернуться к обычному входу"
      footerLinkText="Обычный вход"
      footerLinkUrl="/login"
    >
      <AuthForm type="login" onSubmit={handleLogin} />
    </AuthContainer>
  );
};

export default AdminLogin;