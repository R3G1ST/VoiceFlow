import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('📝 Login attempt:', formData.email);
    console.log('🔐 Auth state before login:', { isAuthenticated: useAuthStore.getState().isAuthenticated });

    try {
      const response = await api.post('/auth/login', formData);
      console.log('📦 Full response data:', response.data);
      
      const { user, accessToken, refreshToken } = response.data;
      
      console.log('✅ Login response:', { 
        hasUser: !!user, 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        user: user
      });

      if (!user || !accessToken) {
        throw new Error('Сервер вернул некорректные данные');
      }

      console.log('🔑 Token received:', accessToken ? 'YES' : 'NO');

      // Сохраняем в store и localStorage
      setAuth(user, accessToken, refreshToken);
      
      // Проверяем что сохранилось
      const stateAfter = useAuthStore.getState();
      console.log('🔍 Auth state after setAuth:', { 
        isAuthenticated: stateAfter.isAuthenticated,
        hasToken: !!stateAfter.accessToken,
        hasUser: !!stateAfter.user,
        user: stateAfter.user
      });

      console.log('🔄 Navigating to home...');

      // Небольшая задержка чтобы убедиться что токен сохранился
      setTimeout(() => {
        console.log('⏰ Timeout complete, navigating...');
        console.log('🔍 Current auth state:', useAuthStore.getState().isAuthenticated);
        navigate('/');
      }, 500);

    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('❌ Error details:', err.response?.data);
      const message = err.response?.data?.message || err.message || 'Ошибка входа';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="bg-primary-100 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">С возвращением!</h1>
          <p className="text-secondary-100">Мы так рады видеть вас снова!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-secondary-100 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-discord"
              placeholder="Введите ваш email"
              required
            />
          </div>

          <div>
            <label className="block text-secondary-100 text-sm font-medium mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-discord"
              placeholder="Введите ваш пароль"
              required
            />
          </div>

          {error && (
            <div className="bg-danger/20 text-danger text-sm p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-discord w-full"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/register" className="text-primary-500 hover:underline text-sm">
            Нет аккаунта? Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}
