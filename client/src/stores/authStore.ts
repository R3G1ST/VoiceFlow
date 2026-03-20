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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken, refreshToken) => {
    console.log('🔐 setAuth called:', { email: user.email, hasToken: !!accessToken });
    
    // Сохраняем в localStorage для сохранения сессии
    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('💾 LocalStorage saved');
    } catch (e) {
      console.error('❌ LocalStorage error:', e);
    }

    // Обновляем состояние
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
    
    console.log('✅ Auth state updated:', get().isAuthenticated);
  },
  logout: () => {
    console.log('🚪 logout called');
    
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
  const refreshToken = localStorage.getItem('refreshToken');

  if (token && userStr && refreshToken) {
    try {
      const user = JSON.parse(userStr);
      // Используем setState напрямую чтобы избежать дублирования
      useAuthStore.setState({
        user,
        accessToken: token,
        refreshToken,
        isAuthenticated: true,
      });
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
}
