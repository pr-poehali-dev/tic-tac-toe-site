import React from "react";
import { useNavigate } from "react-router-dom";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (values: LoginFormValues) => {
    console.log("Данные для входа:", values);
    // В реальном приложении здесь должна быть проверка на сервере
    
    // Имитация успешного входа
    setTimeout(() => {
      login(values.username);
      navigate("/");
    }, 1500);
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