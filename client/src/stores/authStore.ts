import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username: string;
  discriminator: string;
  avatar?: string;
  status: string;
  customStatus?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken, refreshToken) => {
    // Сохраняем в localStorage для сохранения сессии
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },
  logout: () => {
    // Очищаем localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
  updateUser: (userData) =>
    set((state) => {
      const newUser = state.user ? { ...state.user, ...userData } : null;
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      }
      return { user: newUser };
    }),
}));

// Восстанавливаем сессию при загрузке
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      useAuthStore.getState().setAuth(
        user,
        token,
        localStorage.getItem('refreshToken') || ''
      );
    } catch (e) {
      localStorage.removeItem('user');
    }
  }
}
