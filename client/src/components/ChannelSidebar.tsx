import { useServerStore } from '../../stores/serverStore';
import { Hash, Mic, Plus, Settings } from 'lucide-react';

export default function ChannelSidebar() {
  const { currentServer, currentChannel, setCurrentChannel } = useServerStore();

  if (!currentServer) {
    return (
      <div className="w-60 bg-primary-200 flex flex-col">
        <div className="p-4 text-center text-secondary-100">
          <p>Выберите сервер чтобы увидеть каналы</p>
        </div>
      </div>
    );
  }

  const textChannels = currentServer.channels?.filter((c) => c.type === 'TEXT') || [];
  const voiceChannels = currentServer.channels?.filter((c) => c.type === 'VOICE') || [];

  return (
    <div className="w-60 bg-primary-200 flex flex-col">
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-primary-300 shadow-sm">
        <h2 className="font-semibold text-white truncate">{currentServer.name}</h2>
        <Settings className="w-5 h-5 text-secondary-100 hover:text-white cursor-pointer" />
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-3">
        {/* Text Channels */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-semibold text-secondary-200 uppercase">
              Текстовые каналы
            </span>
            <Plus className="w-4 h-4 text-secondary-200 hover:text-white cursor-pointer" />
          </div>
          {textChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setCurrentChannel(channel)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded mx-2 cursor-pointer transition-colors duration-100 ${
                currentChannel?.id === channel.id
                  ? 'bg-secondary-400 text-white'
                  : 'text-secondary-100 hover:bg-secondary-500'
              }`}
            >
              <Hash className="w-5 h-5 text-secondary-300" />
              <span className="truncate">{channel.name}</span>
            </div>
          ))}
          {textChannels.length === 0 && (
            <p className="text-xs text-secondary-400 px-2">Нет текстовых каналов</p>
          )}
        </div>

        {/* Voice Channels */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-semibold text-secondary-200 uppercase">
              Голосовые каналы
            </span>
            <Plus className="w-4 h-4 text-secondary-200 hover:text-white cursor-pointer" />
          </div>
          {voiceChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setCurrentChannel(channel)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded mx-2 cursor-pointer transition-colors duration-100 ${
                currentChannel?.id === channel.id
                  ? 'bg-secondary-400 text-white'
                  : 'text-secondary-100 hover:bg-secondary-500'
              }`}
            >
              <Mic className="w-5 h-5 text-secondary-300" />
              <span className="truncate">{channel.name}</span>
            </div>
          ))}
          {voiceChannels.length === 0 && (
            <p className="text-xs text-secondary-400 px-2">Нет голосовых каналов</p>
          )}
        </div>
      </div>

      {/* User Panel */}
      <div className="bg-primary-200 p-3 flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-primary-200 bg-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user?.username}
          </p>
          <p className="text-xs text-secondary-200 truncate">
            {user?.customStatus || 'VoiceFlow User'}
          </p>
        </div>
      </div>
    </div>
  );
}
