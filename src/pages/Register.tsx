import React from "react";
import { useNavigate } from "react-router-dom";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const handleRegister = async (values: RegisterFormValues) => {
    console.log('Попытка регистрации:', values);
    
    try {
      const success = await register({
        username: values.username,
        password: values.password
      });
      
      console.log('Результат регистрации:', success);
      
      if (success) {
        toast({
          title: "Успешная регистрация",
          description: "Добро пожаловать!",
        });
        
        navigate("/", { replace: true });
      } else {
        toast({
          title: "Ошибка регистрации",
          description: "Проверьте данные и попробуйте снова",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при регистрации",
        variant: "destructive",
      });
    }
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