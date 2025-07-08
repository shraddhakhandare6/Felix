
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<KeycloakProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { updateUser } = useUser();

  // This effect runs only once on initial mount to initialize Keycloak
  useEffect(() => {
    const init = async () => {
      try {
        if (!keycloak) {
          console.error('Keycloak is not configured. Please provide NEXT_PUBLIC_KEYCLOAK_URL, NEXT_PUBLIC_KEYCLOAK_REALM, and NEXT_PUBLIC_KEYCLOAK_CLIENT_ID in your .env file.');
          return;
        }

        // Prevents re-initialization
        if (keycloak.authenticated !== undefined) {
          return;
        }
        
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
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once.


  // This effect handles routing based on authentication state
  useEffect(() => {
    if (loading) return; // Don't route until loaded

    if (!isAuthenticated && !isPublicPage(pathname)) {
      router.push('/login');
    }

    if (isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, pathname, router]);


  // This effect sets up Keycloak event handlers
  useEffect(() => {
    if (!keycloak) return;

    const onTokens = () => {
      if (keycloak?.token) {
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
      if (keycloak) {
        keycloak.onAuthSuccess = undefined;
        keycloak.onAuthRefreshSuccess = undefined;
        keycloak.onAuthLogout = undefined;
      }
    };
  }, [router, updateUser]);


  const login = () => keycloak?.login();
  const logout = () => {
    localStorage.removeItem('user');
    keycloak?.logout();
  };

  if (loading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated && !isPublicPage(pathname)) {
      return <PageLoader />;
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
