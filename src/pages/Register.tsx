import React from "react";
import { useNavigate } from "react-router-dom";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = (values: RegisterFormValues) => {
    console.log("Данные для регистрации:", values);
    // В реальном приложении здесь должна быть отправка данных на сервер
    
    // Имитация успешной регистрации
    setTimeout(() => {
      login(values.username);
      navigate("/");
    }, 1500);
  };

  return (
    <AuthContainer
      title="Создание аккаунта"
      description="Зарегистрируйтесь, чтобы начать играть"
      footerText="Уже есть аккаунт?"
      footerLinkText="Войти"
      footerLinkUrl="/login"
    >
      <AuthForm type="register" onSubmit={handleRegister} />
    </AuthContainer>
  );
};

export default Register;