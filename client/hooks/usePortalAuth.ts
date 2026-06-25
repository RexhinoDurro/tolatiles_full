'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { portalApi } from '@/lib/portalApi';
import type { PortalUser } from '@/types/api';

interface PortalAuthState {
  user: PortalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePortalAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<PortalAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = portalApi.getStoredUser();
      const isAuthenticated = portalApi.isAuthenticated();

      if (isAuthenticated && storedUser) {
        try {
          const user = await portalApi.getCurrentUser();
          if (!user.is_quotes_manager) {
            portalApi.clearTokens();
            setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null });
            return;
          }
          setAuthState({ user: user as PortalUser, isAuthenticated: true, isLoading: false, error: null });
        } catch {
          portalApi.clearTokens();
          setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await portalApi.login(username, password);
      setAuthState({ user: response.user, isAuthenticated: true, isLoading: false, error: null });
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Login failed';
      setAuthState((prev) => ({ ...prev, isLoading: false, error }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      await portalApi.logout();
    } finally {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      router.push('/quotes-portal/login');
    }
  }, [router]);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return { ...authState, login, logout, clearError };
}

export function useRequirePortalAuth() {
  const auth = usePortalAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/quotes-portal/login');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  return auth;
}
