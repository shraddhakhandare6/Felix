
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import keycloak from '@/lib/keycloak';
import { PageLoader } from './page-loader';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // keycloak is undefined on the server. We only proceed on the client.
    if (!keycloak) {
      setLoading(false);
      return;
    }

    // This check is for client-side misconfiguration
    if (!keycloak.authServerUrl) {
      console.error('Keycloak is not configured. Please provide NEXT_PUBLIC_KEYCLOAK_URL, NEXT_PUBLIC_KEYCLOAK_REALM, and NEXT_PUBLIC_KEYCLOAK_CLIENT_ID environment variables.');
      setLoading(false);
      return;
    }

    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/silent-check-sso.html` : undefined,
          pkceMethod: 'S256',
        });

        setIsAuthenticated(authenticated);
        setToken(authenticated && keycloak.token ? keycloak.token : null);


        if (authenticated) {
            const userProfile = await keycloak.loadUserProfile();
            const user = {
                username: userProfile.username || 'User',
                email: userProfile.email || 'user@example.com'
            };
            localStorage.setItem('user', JSON.stringify(user));
        }

      } catch (error) {
        console.error('Keycloak init failed', error);
      } finally {
        setLoading(false);
      }
    };
    
    initKeycloak();

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then((refreshed) => {
        if (refreshed) {
          setToken(keycloak.token ?? null);

        } else {
          console.warn('Token not refreshed, user might be logged out');
        }
      });
    };
  }, []);

  const login = () => keycloak?.login();
  const logout = () => {
    localStorage.removeItem('user');
    keycloak?.logout();
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
