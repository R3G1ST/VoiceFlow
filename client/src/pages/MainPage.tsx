import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useServerStore } from '../stores/serverStore';
import api from '../services/api';

export default function MainPage() {
  const { user, logout } = useAuthStore();
  const { servers, loadServers } = useServerStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('🔍 MainPage:', { user, serversCount: servers.length, loading, error });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔑 Checking auth...');
      const userResponse = await api.get('/users/me');
      console.log('✅ User:', userResponse.data.username);
      
      console.log('📚 Loading servers...');
      await loadServers();
      console.log('✅ Servers loaded:', servers.length);
      
      setLoading(false);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Ошибка загрузки');
      setLoading(false);
    }
  };

  if (loading) {
    console.log('⏳ Loading...');
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-primary-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Загрузка...</p>
          {error && <p className="text-danger mt-2">Ошибка: {error}</p>}
        </div>
      </div>
    );
  }

  console.log('✅ Rendering UI');

  return (
    <div className="h-screen w-screen bg-primary-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          ✅ Добро пожаловать в VoiceFlow!
        </h1>
        <p className="text-secondary-100 mb-6">
          Вы вошли как: <strong className="text-white">{user?.username}#{user?.discriminator}</strong>
        </p>
        
        <div className="bg-primary-200 p-6 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-white mb-4">📊 Статус:</h2>
          <p className="text-secondary-100">Серверов: {servers.length}</p>
          <p className="text-secondary-100">API: Подключено</p>
          <p className="text-success">Статус: Онлайн</p>
        </div>

        <button
          onClick={logout}
          className="mt-6 btn-discord-secondary"
        >
          Выйти
        </button>

        <p className="text-secondary-400 text-sm mt-8">
          🎉 VoiceFlow работает!
        </p>
      </div>
    </div>
  );
}
