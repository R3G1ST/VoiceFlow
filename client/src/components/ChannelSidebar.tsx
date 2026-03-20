import { useState } from 'react';
import { useServerStore } from '../stores/serverStore';
import { useAuthStore } from '../stores/authStore';
import { Hash, Mic, Plus, Settings, LogOut, X } from 'lucide-react';
import api from '../services/api';

export default function ChannelSidebar() {
  const { currentServer, currentChannel, setCurrentChannel, addChannel } = useServerStore();
  const { user, logout } = useAuthStore();
  const [showCreateChannel, setShowCreateChannel] = useState<{ type: 'TEXT' | 'VOICE' } | null>(null);
  const [newChannelName, setNewChannelName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentServer || !showCreateChannel || !newChannelName.trim()) return;

    setCreating(true);
    try {
      const response = await api.post(`/channels/servers/${currentServer.id}`, {
        name: newChannelName.trim(),
        type: showCreateChannel.type,
      });
      const channel = response.data;
      addChannel(currentServer.id, channel);
      setShowCreateChannel(null);
      setNewChannelName('');
    } catch (err: any) {
      console.error('❌ Create channel error:', err);
      alert(err.response?.data?.message || 'Ошибка создания канала');
    } finally {
      setCreating(false);
    }
  };

  if (!currentServer) {
    return (
      <div className="w-60 bg-[#2b2d31] flex flex-col">
        <div className="p-4 text-center text-[#949ba4]">
          <p>Выберите сервер чтобы увидеть каналы</p>
        </div>

        {/* User Panel without server selected */}
        <div className="bg-[#232428] p-3 flex items-center gap-3 border-t border-[#1e1f22]">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#232428] bg-[#23a559]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-[#949ba4] truncate">
              {user?.customStatus || 'VoiceFlow User'}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-[#949ba4] hover:text-white hover:bg-[#3f4147] rounded transition-colors"
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const textChannels = currentServer.channels?.filter((c: any) => c.type === 'TEXT') || [];
  const voiceChannels = currentServer.channels?.filter((c: any) => c.type === 'VOICE') || [];

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col relative">
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#1e1f22] shadow-sm hover:bg-[#35373c] cursor-pointer transition-colors">
        <h2 className="font-semibold text-white truncate text-sm">{currentServer.name}</h2>
        <Settings className="w-4 h-4 text-[#949ba4] hover:text-white cursor-pointer" />
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-3">
        {/* Text Channels */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-semibold text-[#949ba4] uppercase hover:text-[#dbdee1] cursor-pointer">
              Текстовые каналы
            </span>
            <Plus 
              className="w-4 h-4 text-[#949ba4] hover:text-[#dbdee1] cursor-pointer" 
              onClick={() => setShowCreateChannel({ type: 'TEXT' })}
            />
          </div>
          {textChannels.map((channel: any) => (
            <div
              key={channel.id}
              onClick={() => setCurrentChannel(channel)}
              className={`flex items-center gap-1 px-2 py-1.5 mx-2 rounded cursor-pointer transition-colors group ${
                currentChannel?.id === channel.id
                  ? 'bg-[#404249] text-white'
                  : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
              }`}
            >
              <Hash className="w-5 h-5 text-[#80848e]" />
              <span className="font-medium truncate">{channel.name}</span>
            </div>
          ))}
          {textChannels.length === 0 && (
            <p className="text-xs text-[#949ba4] px-2">Нет текстовых каналов</p>
          )}
        </div>

        {/* Voice Channels */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-semibold text-[#949ba4] uppercase hover:text-[#dbdee1] cursor-pointer">
              Голосовые каналы
            </span>
            <Plus 
              className="w-4 h-4 text-[#949ba4] hover:text-[#dbdee1] cursor-pointer"
              onClick={() => setShowCreateChannel({ type: 'VOICE' })}
            />
          </div>
          {voiceChannels.map((channel: any) => (
            <div
              key={channel.id}
              onClick={() => setCurrentChannel(channel)}
              className={`flex items-center gap-1 px-2 py-1.5 mx-2 rounded cursor-pointer transition-colors group ${
                currentChannel?.id === channel.id
                  ? 'bg-[#404249] text-white'
                  : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
              }`}
            >
              <Mic className="w-5 h-5 text-[#80848e]" />
              <span className="font-medium truncate">{channel.name}</span>
            </div>
          ))}
          {voiceChannels.length === 0 && (
            <p className="text-xs text-[#949ba4] px-2">Нет голосовых каналов</p>
          )}
        </div>
      </div>

      {/* User Panel */}
      <div className="bg-[#232428] p-3 flex items-center gap-3 border-t border-[#1e1f22]">
        <div className="relative group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-semibold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#232428] bg-[#23a559]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user?.username}
          </p>
          <p className="text-xs text-[#949ba4] truncate">
            {user?.customStatus || 'VoiceFlow User'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 text-[#949ba4] hover:text-white hover:bg-[#3f4147] rounded transition-colors"
            title="Микрофон"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 text-[#949ba4] hover:text-white hover:bg-[#3f4147] rounded transition-colors"
            title="Настройки"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="p-1.5 text-[#949ba4] hover:text-white hover:bg-[#3f4147] rounded transition-colors"
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowCreateChannel(null)}>
          <div className="bg-[#313338] rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                Создать {showCreateChannel.type === 'TEXT' ? 'текстовый' : 'голосовой'} канал
              </h3>
              <button onClick={() => setShowCreateChannel(null)} className="text-[#949ba4] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel}>
              <div className="mb-4">
                <label className="block text-[#b5bac1] text-xs font-bold uppercase mb-2">
                  Название канала
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full bg-[#1e1f22] border border-[#1e1f22] rounded px-3 py-2.5 text-white placeholder-[#949ba4] focus:outline-none focus:border-[#5865f2] transition-colors"
                  placeholder={showCreateChannel.type === 'TEXT' ? 'например: общий' : 'например: Голосовой 1'}
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateChannel(null)}
                  className="px-4 py-2 text-[#b5bac1] hover:text-white hover:bg-[#3f4147] rounded transition-colors font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded font-medium transition-colors disabled:opacity-50"
                  disabled={creating || !newChannelName.trim()}
                >
                  {creating ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
