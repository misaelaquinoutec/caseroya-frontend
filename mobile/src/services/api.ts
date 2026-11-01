import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';

export const API_BASE_URL = 'http://10.0.2.2:8080/api'; // 10.0.2.2 for Android Emulator, or local IP for Expo Go

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
