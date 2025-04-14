import React from "react";
import { useNavigate } from "react-router-dom";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthForm from "@/components/auth/AuthForm";

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = (values: RegisterFormValues) => {
    console.log("Данные для регистрации:", values);
    // Здесь должна быть логика регистрации
    // После успешной регистрации перенаправляем на страницу входа
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <AuthContainer
      title="Создание аккаунта"
      description="Заполните форму, чтобы создать новый аккаунт"
      footerText="Уже есть аккаунт?"
      footerLinkText="Войти"
      footerLinkUrl="/login"
    >
      <AuthForm type="register" onSubmit={handleRegister} />
    </AuthContainer>
  );
};

export default Register;
