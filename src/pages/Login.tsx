import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface LocationState {
  from?: {
    pathname: string;
  };
}

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  // Получаем URL, с которого произошло перенаправление
  const from = (location.state as LocationState)?.from?.pathname || "/";

  const handleLogin = async (values: LoginFormValues) => {
    console.log('Login attempt with values:', values);
    try {
      const success = await login(values);
      console.log('Login result:', success);
      
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
        
        toast({
          title: "Успешный вход",
          description: `Добро пожаловать в систему${isAdmin ? ", Администратор" : ""}`,
        });
        
        // Если пользователь - админ, перенаправляем на админ-панель
        if (isAdmin) {
          navigate("/admin", { replace: true });
        } else {
          // Иначе перенаправляем на страницу, с которой пришел пользователь
          navigate(from, { replace: true });
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
      title="Вход в аккаунт"
      description="Введите имя пользователя и пароль для входа"
      footerText="Еще нет аккаунта?"
      footerLinkText="Зарегистрироваться"
      footerLinkUrl="/register"
    >
      <AuthForm type="login" onSubmit={handleLogin} />
    </AuthContainer>
  );
};

export default Login;