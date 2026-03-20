import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useServerStore } from '../stores/serverStore';
import api from '../services/api';
import ServerList from '../components/ServerList';
import ChannelSidebar from '../components/ChannelSidebar';
import ChatArea from '../components/ChatArea';
import MemberList from '../components/MemberList';
import VoicePanel from '../components/VoicePanel';
import CreateServerModal from '../components/CreateServerModal';

export default function MainPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { servers, currentServer, loadServers } = useServerStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateServer, setShowCreateServer] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await api.get('/users/me');
      await loadServers();
      setLoading(false);
    } catch (err: any) {
      console.error('Auth check failed:', err);
      setError('Ошибка авторизации');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Список серверов */}
      <ServerList onOpenCreateServer={() => setShowCreateServer(true)} />

      {/* Боковая панель с каналами */}
      <ChannelSidebar />

      {/* Основная область чата */}
      <ChatArea />

      {/* Список участников */}
      <MemberList />

      {/* Голосовая панель */}
      <VoicePanel />

      {/* Модальное окно создания сервера */}
      {showCreateServer && (
        <CreateServerModal onClose={() => setShowCreateServer(false)} />
      )}
    </div>
  );
}
