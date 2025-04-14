import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRequired?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminRequired = false 
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminRequired && user?.role !== 'admin') {
    // Если требуются права администратора, но у пользователя их нет
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;