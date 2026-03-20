import { useState, useEffect, useRef } from 'react';
import { useServerStore } from '../stores/serverStore';
import { useMessageStore, Message } from '../stores/messageStore';
import { useAuthStore } from '../stores/authStore';
import { Hash, Gift, Smile, Plus, Search, Phone, Video, Pin, Users, Trash2, Edit2 } from 'lucide-react';
import api from '../services/api';
import VoicePanel from './VoicePanel';

export default function ChatArea() {
  const { currentChannel } = useServerStore();
  const { user } = useAuthStore();
  const { messages, loadMessages, addMessage, updateMessage, deleteMessage, clearMessages } = useMessageStore();
  const [inputValue, setInputValue] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMessages = currentChannel ? messages[currentChannel.id] || [] : [];

  useEffect(() => {
    if (currentChannel) {
      loadMessages(currentChannel.id);
    }
  }, [currentChannel?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    if (editingMessageId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingMessageId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChannel || !inputValue.trim()) return;

    if (editingMessageId) {
      // Редактирование сообщения
      try {
        await api.patch(`/messages/${editingMessageId}`, { content: editingContent });
        updateMessage(currentChannel.id, editingMessageId, { content: editingContent, editedAt: new Date().toISOString() });
        setEditingMessageId(null);
        setEditingContent('');
        setInputValue('');
      } catch (err: any) {
        console.error('❌ Edit message error:', err);
      }
      return;
    }

    try {
      const response = await api.post(`/messages/channels/${currentChannel.id}`, {
        content: inputValue.trim(),
      });
      const newMessage = response.data;
      addMessage(currentChannel.id, newMessage);
      setInputValue('');
    } catch (err: any) {
      console.error('❌ Send message error:', err);
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
    setInputValue(message.content);
    inputRef.current?.focus();
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentChannel) return;
    
    try {
      await api.delete(`/messages/${messageId}`);
      deleteMessage(currentChannel.id, messageId);
    } catch (err: any) {
      console.error('❌ Delete message error:', err);
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
    setInputValue('');
    inputRef.current?.focus();
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Сегодня';
    if (isYesterday) return 'Вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  if (!currentChannel) {
    return (
      <div className="flex-1 bg-[#313338] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#41434a] rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="w-12 h-12 text-[#949ba4]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Добро пожаловать в VoiceFlow!
          </h2>
          <p className="text-[#949ba4]">
            Выберите канал чтобы начать общение
          </p>
        </div>
      </div>
    );
  }

  // Группировка сообщений по дате
  const groupedMessages: Record<string, Message[]> = {};
  currentMessages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    groupedMessages[dateKey].push(msg);
  });

  return (
    <div className="flex-1 flex flex-col bg-[#313338] min-w-0">
      {/* Channel Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#26272d] shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <Hash className="w-6 h-6 text-[#80848e]" />
          <span className="font-semibold text-white">{currentChannel.name}</span>
          <span className="text-[#949ba4] text-sm ml-2 hidden lg:block">
            — описание канала
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-[#b5bac1] hover:text-white cursor-pointer transition-colors" />
          <Video className="w-5 h-5 text-[#b5bac1] hover:text-white cursor-pointer transition-colors" />
          <Pin className="w-5 h-5 text-[#b5bac1] hover:text-white cursor-pointer transition-colors" />
          <Users className="w-5 h-5 text-[#b5bac1] hover:text-white cursor-pointer transition-colors" />
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск"
              className="bg-[#1e1f22] text-[#dbdee1] text-sm px-2 py-1 rounded w-36 focus:w-56 focus:outline-none transition-all placeholder-[#949ba4]"
            />
            <Search className="w-4 h-4 text-[#949ba4] absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentMessages.length === 0 ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#41434a] rounded-full flex items-center justify-center">
              <Hash className="w-8 h-8 text-[#949ba4]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Это начало канала #{currentChannel.name}
              </h3>
              <p className="text-[#949ba4]">
                Это самое начало истории канала #{currentChannel.name}.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
              <div key={dateKey}>
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-[1px] bg-[#3f4147]" />
                  <span className="text-xs font-semibold text-[#949ba4] uppercase">
                    {formatMessageDate(dayMessages[0].createdAt)}
                  </span>
                  <div className="flex-1 h-[1px] bg-[#3f4147]" />
                </div>
                <div className="space-y-1">
                  {dayMessages.map((message, idx) => {
                    const prevMessage = dayMessages[idx - 1];
                    const isCompact = prevMessage && 
                      prevMessage.userId === message.userId &&
                      new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 5 * 60 * 1000;

                    return (
                      <div
                        key={message.id}
                        className={`group flex gap-4 px-4 py-0.5 hover:bg-[#2e3035] rounded -mx-4 ${
                          message.deletedAt ? 'opacity-50' : ''
                        }`}
                      >
                        {!isCompact ? (
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-semibold overflow-hidden">
                            {message.author.avatar ? (
                              <img src={message.author.avatar} alt={message.author.username} className="w-full h-full object-cover" />
                            ) : (
                              message.author.username.charAt(0).toUpperCase()
                            )}
                          </div>
                        ) : (
                          <div className="w-10 text-xs text-[#949ba4] opacity-0 group-hover:opacity-100 transition-opacity text-right">
                            {formatMessageTime(message.createdAt)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {!isCompact && (
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-white hover:underline cursor-pointer">
                                {message.author.username}
                              </span>
                              <span className="text-xs text-[#949ba4]">
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {message.editedAt && (
                                <span className="text-xs text-[#949ba4]">(изменено)</span>
                              )}
                            </div>
                          )}
                          <div className="text-[#dbdee1] whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                          {/* Кнопки действий при наведении */}
                          <div className="absolute right-4 -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#313338] rounded shadow-lg">
                            {message.userId === user?.id && !message.deletedAt && (
                              <>
                                <button
                                  onClick={() => handleEditMessage(message)}
                                  className="p-1.5 text-[#949ba4] hover:text-white hover:bg-[#3f4147] rounded transition-colors"
                                  title="Редактировать"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="p-1.5 text-[#949ba4] hover:text-[#f23f43] hover:bg-[#3f4147] rounded transition-colors"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="px-4 pb-6 flex-shrink-0">
        {editingMessageId && (
          <div className="mb-2 p-2 bg-[#2b2d31] rounded border-l-4 border-[#5865f2] flex items-center justify-between">
            <span className="text-sm text-[#949ba4]">Редактирование сообщения</span>
            <button onClick={cancelEdit} className="text-[#949ba4] hover:text-white">
              <span className="text-lg">×</span>
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage}>
          <div className="flex items-center gap-3 bg-[#383a40] rounded-lg px-4 py-2.5">
            <button type="button" className="text-[#b5bac1] hover:text-[#dbdee1] transition-colors">
              <Plus className="w-6 h-6" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent text-[#dbdee1] focus:outline-none placeholder-[#949ba4]"
              placeholder={editingMessageId ? 'Редактировать сообщение...' : `Написать сообщение в #${currentChannel.name}`}
            />
            <button type="button" className="text-[#b5bac1] hover:text-[#dbdee1] transition-colors">
              <Gift className="w-6 h-6" />
            </button>
            <button type="button" className="text-[#b5bac1] hover:text-[#dbdee1] transition-colors">
              <Smile className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>

      {/* Voice Panel - shows when voice channel selected */}
      <VoicePanel />
    </div>
  );
}
