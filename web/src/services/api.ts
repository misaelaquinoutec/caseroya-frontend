import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'https://proyecto-caseroya-cr2n.onrender.com/api';
const normalizedBaseURL = rawUrl.replace(/\/+$/, '').endsWith('/api')
  ? rawUrl.replace(/\/+$/, '')
  : `${rawUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: normalizedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Error en la petición';
    return Promise.reject(new Error(message));
  }
);

export const createCancelToken = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
};

export default api;
