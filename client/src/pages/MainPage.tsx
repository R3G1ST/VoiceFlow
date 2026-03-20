import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useServerStore } from '../stores/serverStore';
import api from '../services/api';
import ServerList from '../components/ServerList';
import ChannelSidebar from '../components/ChannelSidebar';
import ChatArea from '../components/ChatArea';
import MemberList from '../components/MemberList';
import CreateServerModal from '../components/CreateServerModal';

export default function MainPage() {
  const { user, logout } = useAuthStore();
  const { servers, currentServer, loadServers, setCurrentServer } = useServerStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateServer, setShowCreateServer] = useState(false);

  console.log('🔍 MainPage:', { user, serversCount: servers.length, currentServer, loading, error });

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
      const errorMessage = err.response?.status === 401
        ? 'Неавторизован. Выйдите и войдите снова.'
        : err.message || 'Ошибка загрузки';
      setError(errorMessage);
      setLoading(false);

      // Если 401, выходим через 2 секунды
      if (err.response?.status === 401) {
        setTimeout(() => logout(), 2000);
      }
    }
  };

  const handleServerClick = async (server: any) => {
    try {
      // Загружаем полную информацию о сервере с участниками
      const response = await api.get(`/servers/${server.id}`);
      const fullServer = response.data.server;
      setCurrentServer(fullServer);
    } catch (err: any) {
      console.error('❌ Failed to load server details:', err);
      setCurrentServer(server);
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
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Server List (leftmost) - 72px */}
      <ServerList 
        onOpenCreateServer={() => setShowCreateServer(true)}
        onServerClick={handleServerClick}
      />

      {/* Channel Sidebar + Chat + Member List */}
      <div className="flex-1 flex">
        {/* Channel Sidebar - 240px */}
        <ChannelSidebar />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatArea />
        </div>

        {/* Member List - 240px */}
        <MemberList />
      </div>

      {/* Create Server Modal */}
      {showCreateServer && (
        <CreateServerModal onClose={() => setShowCreateServer(false)} />
      )}
    </div>
  );
}
