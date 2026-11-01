import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, MobileUser } from '../services/authService';

interface AuthContextType {
  user: MobileUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (codigo: string, clave: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const current = await authService.getCurrentUser();
        if (current && current.token) {
          setUser(current);
        }
      } catch (e) {
        console.warn('Error loading auth user:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (codigo: string, clave: string) => {
    const loggedUser = await authService.login(codigo, clave);
    setUser(loggedUser);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
