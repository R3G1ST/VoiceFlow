import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useServerStore } from '../../stores/serverStore';
import api from '../../services/api';

interface CreateServerModalProps {
  onClose: () => void;
}

export default function CreateServerModal({ onClose }: CreateServerModalProps) {
  const { user } = useAuthStore();
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
      
      addServer(server);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-primary-100 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Создать сервер</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-secondary-100 text-sm font-medium mb-2">
              Название сервера
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-discord"
              placeholder="Введите название сервера"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="bg-danger/20 text-danger text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-discord-secondary"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-discord"
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
