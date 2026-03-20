import { useState } from 'react';
import { useServerStore } from '../stores/serverStore';
import api from '../services/api';

interface CreateServerModalProps {
  onClose: () => void;
}

export default function CreateServerModal({ onClose }: CreateServerModalProps) {
  const { addServer } = useServerStore();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/servers', { name });
      const server = response.data;

      // Добавляем сервер в store
      addServer(server);
      onClose();
    } catch (err: any) {
      console.error('❌ Create server error:', err);
      setError(err.response?.data?.message || 'Ошибка создания сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#313338] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-2">Создать сервер</h2>
        <p className="text-[#b5bac1] text-sm mb-6">
          Вы создаёте сервер — выберите название и настройте каналы позже.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#b5bac1] text-xs font-bold uppercase mb-2">
              Название сервера
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1e1f22] border border-[#1e1f22] rounded px-3 py-2.5 text-white placeholder-[#949ba4] focus:outline-none focus:border-[#5865f2] transition-colors"
              placeholder="Например: Моя компания"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="bg-[#f23f43]/10 text-[#f23f43] text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#b5bac1] hover:text-white hover:bg-[#3f4147] rounded transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded font-medium transition-colors disabled:opacity-50"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
