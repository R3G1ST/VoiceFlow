import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import LoadingScreen from './components/LoadingScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import api from './services/api';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      await api.get('/auth/login', {
        timeout: 3000,
        validateStatus: (status) => status < 500
      });
      setConnectionError(null);
      console.log('✅ Сервер подключен');
    } catch (error: any) {
      console.error('❌ Ошибка подключения к серверу:', error);
      setConnectionError('Сервер недоступен. Попробуйте позже.');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setConnectionError(null);
    checkServerConnection();
  };

  if (isLoading) {
    return <LoadingScreen onRetry={handleRetry} error={connectionError} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <MainPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
