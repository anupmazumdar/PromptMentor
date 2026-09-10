import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginApi, registerApi, logoutApi, getProfileApi, demoLoginApi } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('pm_access_token');
      const cachedUser = localStorage.getItem('pm_user');

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          // ignore cache parse error
        }
      }

      if (token) {
        try {
          const profile = await getProfileApi();
          setUser(profile);
          localStorage.setItem('pm_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Could not restore auth session:', err);
          localStorage.removeItem('pm_access_token');
          localStorage.removeItem('pm_refresh_token');
          localStorage.removeItem('pm_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    localStorage.setItem('pm_access_token', data.accessToken);
    localStorage.setItem('pm_refresh_token', data.refreshToken);
    localStorage.setItem('pm_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const demoLogin = async () => {
    const data = await demoLoginApi();
    localStorage.setItem('pm_access_token', data.accessToken);
    localStorage.setItem('pm_refresh_token', data.refreshToken);
    localStorage.setItem('pm_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (email: string, password: string, name?: string) => {
    const data = await registerApi(email, password, name);
    localStorage.setItem('pm_access_token', data.accessToken);
    localStorage.setItem('pm_refresh_token', data.refreshToken);
    localStorage.setItem('pm_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('pm_refresh_token') || undefined;
    await logoutApi(refreshToken);
    localStorage.removeItem('pm_access_token');
    localStorage.removeItem('pm_refresh_token');
    localStorage.removeItem('pm_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
