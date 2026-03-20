import { useState } from 'react';
import { Mic, MicOff, Headphones, PhoneOff, Video, Monitor } from 'lucide-react';
import { useServerStore } from '../../stores/serverStore';

export default function VoicePanel() {
  const { currentChannel } = useServerStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  if (!currentChannel || currentChannel.type !== 'VOICE') {
    return null;
  }

  const handleConnect = () => {
    setIsConnected(!isConnected);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsMuted(false);
    setIsDeafened(false);
    setIsVideoEnabled(false);
    setIsScreenSharing(false);
  };

  return (
    <div className="absolute bottom-0 left-64 right-64 bg-primary-200 p-3 flex items-center gap-4">
      {isConnected ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Подключено к {currentChannel.name}
              </p>
              <p className="text-xs text-secondary-200">Голосовой канал</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded ${isMuted ? 'bg-danger' : 'bg-primary-300 hover:bg-primary-400'}`}
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={() => setIsDeafened(!isDeafened)}
              className={`p-2 rounded ${isDeafened ? 'bg-danger' : 'bg-primary-300 hover:bg-primary-400'}`}
              title={isDeafened ? 'Включить звук' : 'Выключить звук'}
            >
              <Headphones className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-2 rounded ${isVideoEnabled ? 'bg-success' : 'bg-primary-300 hover:bg-primary-400'}`}
              title={isVideoEnabled ? 'Выключить видео' : 'Включить видео'}
            >
              <Video className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-2 rounded ${isScreenSharing ? 'bg-success' : 'bg-primary-300 hover:bg-primary-400'}`}
              title={isScreenSharing ? 'Остановить демонстрацию' : 'Демонстрация экрана'}
            >
              <Monitor className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={handleDisconnect}
              className="p-2 rounded bg-danger hover:bg-red-600"
              title="Отключиться"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          </div>
        </>
      ) : (
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-secondary-200" />
            <span className="text-white text-sm">{currentChannel.name}</span>
          </div>
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm font-medium"
          >
            Подключиться
          </button>
        </div>
      )}
    </div>
  );
}
