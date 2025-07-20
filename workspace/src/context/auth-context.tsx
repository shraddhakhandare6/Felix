
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import keycloak from '@/lib/keycloak';
import type { KeycloakProfile } from 'keycloak-js';
import { FancyLoader } from '@/components/ui/fancy-loader';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<KeycloakProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { updateUser } = useUser();

  const initKeycloak = useCallback(async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : undefined,
        pkceMethod: 'S256',
      });

      setIsAuthenticated(authenticated);

      if (authenticated) {
        const profile = await keycloak.loadUserProfile();
        setUser(profile);
        if (profile.username && profile.email) {
          updateUser({ username: profile.username, email: profile.email });
        }
        
        if (pathname === '/login') {
            router.push('/dashboard');
        }
      } else {
        if (!isPublicPage(pathname)) {
            router.push('/login');
        }
      }
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      setIsAuthenticated(false);
      if (!isPublicPage(pathname)) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router, pathname, updateUser]);

  useEffect(() => {
    if (!keycloak.authServerUrl) {
      console.error('Keycloak is not configured. Please provide NEXT_PUBLIC_KEYCLOAK_URL, NEXT_PUBLIC_KEYCLOAK_REALM, and NEXT_PUBLIC_KEYCLOAK_CLIENT_ID in your .env file.');
      setLoading(false);
      return;
    }
    initKeycloak();
  }, [initKeycloak]);

  useEffect(() => {
    const onTokens = () => {
      if (keycloak.token) {
        keycloak.loadUserProfile().then(profile => {
            setUser(profile);
            if (profile.username && profile.email) {
                updateUser({ username: profile.username, email: profile.email });
            }
        });
      }
    };

    keycloak.onAuthSuccess = () => {
      setIsAuthenticated(true);
      onTokens();
    };
    keycloak.onAuthRefreshSuccess = onTokens;
    keycloak.onAuthLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      updateUser({ username: 'User', email: 'user@coe.com' });
      router.push('/login');
    };

    return () => {
      keycloak.onAuthSuccess = undefined;
      keycloak.onAuthRefreshSuccess = undefined;
      keycloak.onAuthLogout = undefined;
    };
  }, [router, updateUser]);


  const login = () => keycloak.login();
  const logout = () => {
    localStorage.removeItem('user');
    keycloak.logout();
  };

  if (loading) {
    return <FancyLoader />;
  }
  
  if (!isAuthenticated && !isPublicPage(pathname)) {
      return <FancyLoader />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
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
