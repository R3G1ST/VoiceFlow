import { create } from 'zustand';
import api from '../services/api';

export interface Server {
  id: string;
  name: string;
  icon?: string;
  ownerId?: string;
  channels?: Channel[];
  members?: ServerMember[];
  _count?: { members: number };
}

export interface Channel {
  id: string;
  name: string;
  type: 'VOICE' | 'TEXT';
  position?: number;
}

export interface ServerMember {
  id: string;
  userId: string;
  nickname?: string;
  user: {
    id: string;
    username: string;
    discriminator?: string;
    avatar?: string;
    status?: string;
    customStatus?: string;
  };
}

interface ServerState {
  servers: Server[];
  currentServer: Server | null;
  currentChannel: Channel | null;
  loadServers: () => Promise<void>;
  setCurrentServer: (server: Server | null) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  addServer: (server: Server) => void;
  updateServer: (serverId: string, data: Partial<Server>) => void;
  deleteServer: (serverId: string) => void;
  addChannel: (serverId: string, channel: Channel) => void;
  deleteChannel: (channelId: string) => void;
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  currentServer: null,
  currentChannel: null,

  loadServers: async () => {
    try {
      const response = await api.get('/servers');
      const memberships = response.data;
      
      // Преобразуем формат: API возвращает { server, member }
      const servers = memberships.map((m: any) => m.server);
      
      set({ servers });
      
      // Если текущий сервер есть в списке, обновляем его
      const { currentServer } = get();
      if (currentServer) {
        const updated = servers.find((s: Server) => s.id === currentServer.id);
        if (updated) {
          set({ currentServer: updated });
        }
      }
    } catch (error) {
      console.error('❌ Failed to load servers:', error);
      set({ servers: [] });
    }
  },

  setCurrentServer: (server) => {
    set({ 
      currentServer: server,
      currentChannel: null // Сбрасываем канал при смене сервера
    });
  },

  setCurrentChannel: (channel) => set({ currentChannel: channel }),

  addServer: (server) =>
    set((state) => ({ 
      servers: [...state.servers, server],
      currentServer: server // Переключаемся на новый сервер
    })),

  updateServer: (serverId, data) =>
    set((state) => ({
      servers: state.servers.map((s) =>
        s.id === serverId ? { ...s, ...data } : s
      ),
      currentServer: state.currentServer?.id === serverId
        ? { ...state.currentServer, ...data }
        : state.currentServer,
    })),

  deleteServer: (serverId) =>
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== serverId),
      currentServer: state.currentServer?.id === serverId ? null : state.currentServer,
    })),

  addChannel: (serverId, channel) =>
    set((state) => ({
      servers: state.servers.map((s) =>
        s.id === serverId
          ? { ...s, channels: [...(s.channels || []), channel] }
          : s
      ),
      currentServer: state.currentServer?.id === serverId
        ? { ...state.currentServer, channels: [...(state.currentServer.channels || []), channel] }
        : state.currentServer,
    })),

  deleteChannel: (channelId) =>
    set((state) => ({
      servers: state.servers.map((s) => ({
        ...s,
        channels: s.channels?.filter((c) => c.id !== channelId),
      })),
      currentServer: state.currentServer
        ? {
            ...state.currentServer,
            channels: state.currentServer.channels?.filter((c) => c.id !== channelId),
          }
        : null,
      currentChannel: state.currentChannel?.id === channelId ? null : state.currentChannel,
    })),
}));
