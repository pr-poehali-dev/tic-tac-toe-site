import React from "react";
import { useNavigate } from "react-router-dom";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthForm from "@/components/auth/AuthForm";

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (values: LoginFormValues) => {
    console.log("Данные для входа:", values);
    // Здесь должна быть логика авторизации
    // После успешной авторизации перенаправляем на главную страницу
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <AuthContainer
      title="Вход в аккаунт"
      description="Введите данные для входа в свой аккаунт"
      footerText="Еще нет аккаунта?"
      footerLinkText="Зарегистрироваться"
      footerLinkUrl="/register"
    >
      <AuthForm type="login" onSubmit={handleLogin} />
    </AuthContainer>
  );
};

export default Login;
