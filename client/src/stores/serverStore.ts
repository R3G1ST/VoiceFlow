import { create } from 'zustand';

interface Server {
  id: string;
  name: string;
  icon?: string;
  channels?: Channel[];
}

interface Channel {
  id: string;
  name: string;
  type: 'VOICE' | 'TEXT';
}

interface ServerState {
  servers: Server[];
  currentServer: Server | null;
  currentChannel: Channel | null;
  loadServers: () => Promise<void>;
  setCurrentServer: (server: Server | null) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  addServer: (server: Server) => void;
}

export const useServerStore = create<ServerState>((set) => ({
  servers: [],
  currentServer: null,
  currentChannel: null,
  loadServers: async () => {
    // Загрузка серверов с бэкенда
    set({ servers: [] });
  },
  setCurrentServer: (server) => set({ currentServer: server }),
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  addServer: (server) =>
    set((state) => ({ servers: [...state.servers, server] })),
}));
