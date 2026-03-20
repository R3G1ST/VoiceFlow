import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="bg-[#313338] p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Создать аккаунт</h1>
          <p className="text-[#b5bac1]">Мы так рады видеть вас здесь!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#b5bac1] text-sm font-medium mb-2">
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
            <label className="block text-[#b5bac1] text-sm font-medium mb-2">
              Имя пользователя
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input-discord"
              placeholder="Придумайте имя"
              minLength={2}
              maxLength={32}
              required
            />
          </div>

          <div>
            <label className="block text-[#b5bac1] text-sm font-medium mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-discord"
              placeholder="Придумайте пароль"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-[#b5bac1] text-sm font-medium mb-2">
              Подтверждение пароля
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input-discord"
              placeholder="Повторите пароль"
              required
            />
          </div>

          {error && (
            <div className="bg-[#f23f43]/10 text-[#f23f43] text-sm p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-discord w-full"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Продолжить'}
          </button>

          <p className="text-xs text-[#949ba4] text-center">
            Регистрируясь, вы соглашаетесь с нашими Условиями использования и Политикой конфиденциальности.
          </p>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-[#00a8fc] hover:underline text-sm">
            Уже есть аккаунт? Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
