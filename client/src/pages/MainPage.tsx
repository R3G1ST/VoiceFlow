import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export default function MainPage() {
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await api.get('/users/me');
      setLoading(false);
    } catch (error) {
      logout();
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-primary-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-primary-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Добро пожаловать в VoiceFlow!
        </h1>
        <p className="text-secondary-100 mb-6">
          Вы вошли как {user?.username}#{user?.discriminator}
        </p>
        
        <div className="space-y-4">
          <div className="bg-primary-200 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              🎉 Сервер работает!
            </h2>
            <p className="text-secondary-100">
              API подключено и готово к работе
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={logout}
              className="btn-discord-secondary"
            >
              Выйти
            </button>
          </div>
        </div>

        <p className="text-secondary-300 text-sm mt-8">
          Дальнейшая разработка клиента в процессе...
        </p>
      </div>
    </div>
  );
}
