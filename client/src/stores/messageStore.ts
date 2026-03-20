import { create } from 'zustand';
import api from '../services/api';

export interface Message {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  replyToId?: string;
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
  author: {
    id: string;
    username: string;
    discriminator?: string;
    avatar?: string;
  };
}

interface MessageState {
  messages: Record<string, Message[]>; // channelId -> messages
  loadMessages: (channelId: string) => Promise<void>;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, messageId: string, data: Partial<Message>) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  clearMessages: (channelId: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},

  loadMessages: async (channelId: string) => {
    try {
      const response = await api.get(`/channels/${channelId}/messages`);
      const messages = response.data;
      
      // Преобразуем user в author если нужно
      const normalizedMessages = messages.map((m: any) => ({
        ...m,
        author: m.author || m.user,
      }));
      
      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: normalizedMessages,
        },
      }));
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: [],
        },
      }));
    }
  },

  addMessage: (channelId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] || []), message],
      },
    })),

  updateMessage: (channelId, messageId, data) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: state.messages[channelId]?.map((msg) =>
          msg.id === messageId ? { ...msg, ...data } : msg
        ) || [],
      },
    })),

  deleteMessage: (channelId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: state.messages[channelId]?.map((msg) =>
          msg.id === messageId ? { ...msg, content: '[Deleted Message]', deletedAt: new Date().toISOString() } : msg
        ) || [],
      },
    })),

  clearMessages: (channelId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [],
      },
    })),
}));
