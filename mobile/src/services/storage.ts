import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'caseroya_jwt_token';
const USER_KEY = 'caseroya_user_data';

export const storage = {
  saveToken: async (token: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Error saving token to SecureStore:', e);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('Error reading token from SecureStore:', e);
      return null;
    }
  },

  removeToken: async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (e) {
      console.warn('Error removing token from SecureStore:', e);
    }
  },

  saveUser: async (user: object): Promise<void> => {
    try {
      const data = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(USER_KEY, data);
      } else {
        await SecureStore.setItemAsync(USER_KEY, data);
      }
    } catch (e) {
      console.warn('Error saving user data:', e);
    }
  },

  getUser: async (): Promise<any | null> => {
    try {
      let data: string | null = null;
      if (Platform.OS === 'web') {
        data = localStorage.getItem(USER_KEY);
      } else {
        data = await SecureStore.getItemAsync(USER_KEY);
      }
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
};
