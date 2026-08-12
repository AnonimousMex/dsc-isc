import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Role } from '@dsc-isc/shared';
import { apiPost, request } from './apiClient';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
}

export interface TotpSetupRequired {
  requiresTotpSetup: true;
  setupToken: string;
  otpauthUrl: string;
}

type LoginResult = { user: SessionUser } | TotpSetupRequired;

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<LoginResult>;
  confirmTotpSetup: (setupToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await request<{ user: SessionUser }>('/auth/me');
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string, totpCode?: string) => {
    const result = await apiPost<LoginResult>('/auth/login', { email, password, totpCode });
    if ('user' in result) setUser(result.user);
    return result;
  }, []);

  const confirmTotpSetup = useCallback(async (setupToken: string, code: string) => {
    const result = await apiPost<{ user: SessionUser }>('/auth/2fa/confirm', { setupToken, code });
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await apiPost('/auth/logout');
    setUser(null);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiPost('/auth/change-password', { currentPassword, newPassword });
    // El servidor revoca la sesión al cambiar la contraseña (sección 9).
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, confirmTotpSetup, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
