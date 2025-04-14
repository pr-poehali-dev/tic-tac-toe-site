import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Проверяем аутентификацию
  if (!isAuthenticated) {
    // Перенаправляем на страницу логина, сохраняя текущий URL для возврата после авторизации
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если требуются права администратора, проверяем роль
  if (requireAdmin && user?.role !== 'admin') {
    // Перенаправляем на главную страницу, если у пользователя нет прав администратора
    return <Navigate to="/" replace />;
  }

  // Если все проверки пройдены, показываем защищенный контент
  return <>{children}</>;
};

export default ProtectedRoute;