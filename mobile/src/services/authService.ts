import api from './api';
import { storage } from './storage';

export interface MobileUser {
  codigoUsuario: string;
  nombre?: string;
  perfilId?: string;
  token?: string;
}

export const authService = {
  login: async (codigoUsuario: string, clave: string): Promise<MobileUser> => {
    const response = await api.post('/auth/login', { codigoUsuario, clave });
    const { token, perfilId, nombre } = response.data;
    if (token) {
      await storage.saveToken(token);
      const user: MobileUser = {
        codigoUsuario,
        nombre: nombre || codigoUsuario,
        perfilId: perfilId || 'ADMIN',
        token,
      };
      await storage.saveUser(user);
      return user;
    }
    throw new Error('No se recibió token de autenticación');
  },

  logout: async (): Promise<void> => {
    await storage.removeToken();
  },

  getCurrentUser: async (): Promise<MobileUser | null> => {
    return await storage.getUser();
  },
};
