import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://proyecto-caseroya-cr2n.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      await storage.removeToken();
    }
    const message = error.response?.data?.message || error.message || 'Error de conexión con el servidor';
    return Promise.reject(new Error(message));
  }
);

export default api;
