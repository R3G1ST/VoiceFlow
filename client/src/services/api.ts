import axios from 'axios';

// API URL - используем переменную окружения или URL по умолчанию
const API_URL = import.meta.env.VITE_API_URL || 'http://77.105.133.95:3000/api';

console.log('🔧 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    console.log('📡 API Request:', config.method?.toUpperCase(), config.url, {
      hasAuth: !!config.headers.Authorization,
      hasToken: !!token
    });
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.log('🚫 401 Unauthorized - tokens cleared');
    }
    return Promise.reject(error);
  }
);

export default api;
