import { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import LoadingScreen from './components/LoadingScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import api from './services/api';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState('/');

  console.log('🔍 App render:', { isAuthenticated, isLoading, currentRoute });

  useEffect(() => {
    console.log('⚡ App mounted, checking server...');
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    console.log('🔗 Checking server connection...');
    try {
<<<<<<< HEAD
      const response = await api.get('/auth/login', {
        timeout: 5000,
        validateStatus: (status) => status < 500
=======
      // Проверяем доступность API через запрос к login (возвращает 400/401 но не 404)
      await api.get('/auth/login', { 
        timeout: 3000,
        validateStatus: (status) => status < 500 // Не считать ошибкой 400/401
>>>>>>> 0dfd5e2fa9dcb3741b7d7922dcb3896967a932b1
      });
      console.log('✅ Server response:', response.status);
      setConnectionError(null);
    } catch (error: any) {
      console.error('❌ Server connection error:', error.message);
      setConnectionError(`Сервер недоступен: ${error.message}`);
    } finally {
      setTimeout(() => {
        console.log('⏳ Loading complete, showing UI');
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleRetry = () => {
    console.log('🔄 Retry clicked');
    setIsLoading(true);
    setConnectionError(null);
    checkServerConnection();
  };

  // Показываем отладочную информацию
  if (isLoading) {
    console.log('⏳ Showing loading screen');
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-primary-100">
        <div className="text-center">
          <LoadingScreen onRetry={handleRetry} error={connectionError} />
          <p className="text-white mt-4">Загрузка приложения...</p>
          <p className="text-secondary-400 text-sm mt-2">
            {connectionError ? 'Ошибка подключения' : 'Подключение к серверу'}
          </p>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering routes:', { isAuthenticated });

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
