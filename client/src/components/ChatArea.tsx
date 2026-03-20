import { useState, useEffect, useRef } from 'react';
import { useServerStore } from '../../stores/serverStore';
import { Hash, Gift, Smile, Plus, Search, Phone } from 'lucide-react';

export default function ChatArea() {
  const { currentChannel } = useServerStore();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  if (!currentChannel) {
    return (
      <div className="flex-1 bg-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="w-12 h-12 text-secondary-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Добро пожаловать в VoiceFlow!
          </h2>
          <p className="text-secondary-100">
            Выберите канал чтобы начать общение
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-primary-100 min-w-0">
      {/* Channel Header */}
      <div className="h-12 px-4 flex items-center border-b border-primary-300 shadow-sm">
        <Hash className="w-6 h-6 text-secondary-300 mr-2" />
        <span className="font-semibold text-white">{currentChannel.name}</span>
        <div className="ml-auto flex items-center gap-4">
          <Search className="w-5 h-5 text-secondary-200 hover:text-white cursor-pointer" />
          <Phone className="w-5 h-5 text-secondary-200 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-secondary-400 mt-8">
          <p>Это начало канала #{currentChannel.name}</p>
          <p className="text-sm mt-2">Сообщений пока нет</p>
        </div>
      </div>

      {/* Message Input */}
      <div className="px-4 pb-6">
        <div className="flex items-center gap-3 bg-primary-200 rounded-lg px-4 py-2.5">
          <Plus className="w-6 h-6 text-secondary-200 hover:text-white cursor-pointer" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent text-white focus:outline-none"
            placeholder={`Написать сообщение в #${currentChannel.name}`}
          />
          <Gift className="w-6 h-6 text-secondary-200 hover:text-white cursor-pointer" />
          <Smile className="w-6 h-6 text-secondary-200 hover:text-white cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
