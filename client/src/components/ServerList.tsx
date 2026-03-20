import { useServerStore } from '../stores/serverStore';
import { Plus } from 'lucide-react';

interface ServerListProps {
  onOpenCreateServer: () => void;
}

export default function ServerList({ onOpenCreateServer }: ServerListProps) {
  const { servers, currentServer, setCurrentServer } = useServerStore();

  const handleHomeClick = () => {
    setCurrentServer(null);
  };

  return (
    <div className="w-[72px] bg-primary-200 flex flex-col items-center py-3 gap-2 overflow-y-auto">
      {/* Home/Direct Messages */}
      <div
        onClick={handleHomeClick}
        className={`w-12 h-12 rounded-full bg-secondary-500 hover:rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-primary-500 hover:text-white text-secondary-100 ${
          !currentServer ? 'rounded-xl bg-primary-500 text-white' : ''
        }`}
        title="Личные сообщения"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.996 12.001c0 .88-.79 1.59-1.77 1.59-.98 0-1.77-.71-1.77-1.59 0-.88.79-1.59 1.77-1.59.98 0 1.77.71 1.77 1.59zM7.784 12.001c0 .88-.79 1.59-1.77 1.59-.98 0-1.77-.71-1.77-1.59 0-.88.79-1.59 1.77-1.59.98 0 1.77.71 1.77 1.59z" />
        </svg>
      </div>

      <div className="w-8 h-[2px] bg-secondary-500 rounded-lg mx-auto" />

      {/* Servers */}
      {servers.map((server) => (
        <div key={server.id} className="relative group">
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${
              currentServer?.id === server.id
                ? 'h-10'
                : 'h-2 opacity-0 group-hover:opacity-100 group-hover:h-5'
            }`}
          />
          <div
            onClick={() => setCurrentServer(server)}
            className={`w-12 h-12 rounded-full bg-secondary-500 hover:rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-primary-500 hover:text-white text-secondary-100 ${
              currentServer?.id === server.id ? 'rounded-xl bg-primary-500 text-white' : ''
            }`}
            title={server.name}
          >
            {server.icon ? (
              <img src={server.icon} alt={server.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-sm font-medium">
                {server.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Add Server Button */}
      <div
        onClick={onOpenCreateServer}
        className="w-12 h-12 rounded-full bg-secondary-500 hover:rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-success text-success hover:text-white"
        title="Создать сервер"
      >
        <Plus className="w-6 h-6" />
      </div>
    </div>
  );
}
