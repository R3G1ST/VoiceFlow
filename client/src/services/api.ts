import axios from 'axios';

// API URL - используем IP сервера
const API_URL = 'http://77.105.133.95:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Token:', token ? 'EXISTS' : 'NOT FOUND');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.config?.url, error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      console.log('⚠️ 401 Unauthorized - clearing tokens');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Не перенаправляем сразу - даём пользователю увидеть ошибку
    }
    return Promise.reject(error);
  }
);

export default api;
