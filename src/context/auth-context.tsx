
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import keycloak from '@/lib/keycloak';
import type { KeycloakProfile } from 'keycloak-js';
import { PageLoader } from '@/components/page-loader';
import { useUser } from './user-context';

interface AuthContextType {
  isAuthenticated: boolean;
  user: KeycloakProfile | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isPublicPage = (path: string) => {
    return path === '/' || path.startsWith('/welcome') || path === '/login';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<{
    isAuthenticated: boolean;
    user: KeycloakProfile | null;
  }>({ isAuthenticated: false, user: null });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { updateUser } = useUser();

  const initKeycloak = useCallback(async () => {
    try {
      if (!keycloak) {
          throw new Error('Keycloak instance not available');
      }

      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : undefined,
        pkceMethod: 'S256',
      });

      if (authenticated) {
        const profile = await keycloak.loadUserProfile();
        setAuth({ isAuthenticated: true, user: profile });
        if (profile.username && profile.email) {
          updateUser({ username: profile.username, email: profile.email });
        }
      } else {
        setAuth({ isAuthenticated: false, user: null });
      }
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      setAuth({ isAuthenticated: false, user: null });
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    initKeycloak();

    if (!keycloak) return;

    keycloak.onAuthSuccess = async () => {
        const profile = await keycloak.loadUserProfile();
        setAuth({ isAuthenticated: true, user: profile });
         if (profile.username && profile.email) {
          updateUser({ username: profile.username, email: profile.email });
        }
        router.push('/dashboard');
    };

    keycloak.onAuthLogout = () => {
        setAuth({ isAuthenticated: false, user: null });
        updateUser({ username: 'User', email: 'user@coe.com' });
        router.push('/login');
    };

    keycloak.onTokenExpired = async () => {
        await keycloak.updateToken(5);
    }

    return () => {
        keycloak.onAuthSuccess = undefined;
        keycloak.onAuthLogout = undefined;
        keycloak.onTokenExpired = undefined;
    }
  }, [initKeycloak, router, updateUser]);

  useEffect(() => {
    if (loading) return;
    if (!auth.isAuthenticated && !isPublicPage(pathname)) {
      router.push('/login');
    }
    if (auth.isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [loading, auth.isAuthenticated, pathname, router]);

  const login = () => keycloak?.login();
  const logout = () => {
    localStorage.removeItem('user');
    keycloak?.logout();
  };
  
  if (loading) {
    return <PageLoader />;
  }

  if (!auth.isAuthenticated && !isPublicPage(pathname)) {
    return <PageLoader />;
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
