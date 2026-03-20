import { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import LoadingScreen from './components/LoadingScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import api from './services/api';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  console.log('🔍 AppRoutes render:', {
    isAuthenticated,
    currentPath: location.pathname,
    navigate: !!navigate
  });

  // Принудительно перенаправляем на /login если нет аутентификации и мы на главной
  useEffect(() => {
    if (!isAuthenticated && location.pathname === '/') {
      console.log('🔄 Redirecting to /login...');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <MainPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  console.log('🔍 App render:', { isAuthenticated, isLoading });

  useEffect(() => {
    console.log('⚡ App mounted, checking server...');
    console.log('🔍 Initial auth state:', { 
      isAuthenticated,
      hasToken: !!localStorage.getItem('accessToken'),
      hasUser: !!localStorage.getItem('user')
    });
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    console.log('🔗 Checking server connection...');
    try {
      // Проверяем доступность API через POST к register (вернёт 400 если всё ок)
      await api.post('/auth/register', { email: '', username: '', password: '' }, {
        timeout: 3000,
        validateStatus: (status) => status === 400 // Ожидаем 400 Bad Request
      });
      console.log('✅ Server response: OK (400 expected for empty data)');
      setConnectionError(null);
    } catch (error: any) {
      console.error('❌ Server connection error:', error.message);
      console.error('❌ Error status:', error.response?.status);
      setConnectionError(`Сервер недоступен: ${error.message}`);
    } finally {
      // Гарантируем минимальное время показа заставки - 2.5 секунды
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2500 - elapsed);
      console.log(`⏳ Elapsed: ${elapsed}ms, Remaining: ${remaining}ms`);

      setTimeout(() => {
        console.log('⏳ Loading complete, showing UI');
        setIsLoading(false);
      }, remaining);
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
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
