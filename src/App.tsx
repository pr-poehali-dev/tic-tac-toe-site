import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/ui/theme-provider";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import TicTacToe from "./pages/TicTacToe";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import InventoryPage from "./pages/InventoryPage";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <Header />
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        
        {/* Редирект с /game на /tic-tac-toe */}
        <Route path="/game" element={<Navigate to="/tic-tac-toe" replace />} />
        
        {/* Защищенные маршруты */}
        <Route
          path="/tic-tac-toe"
          element={
            <ProtectedRoute>
              <TicTacToe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminRequired>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute adminRequired>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        
        {/* 404 страница */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;