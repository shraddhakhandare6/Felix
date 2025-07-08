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
    // keycloak from the module is null on the server, so we check for it.
    if (!keycloak) {
      setLoading(false);
      return;
    }

    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri:
            window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
        });

        setIsAuthenticated(authenticated);
        setToken(keycloak.token ?? null);

        if (authenticated) {
          const userProfile = await keycloak.loadUserProfile();
          const user = {
            username: userProfile.username || 'User',
            email: userProfile.email || 'user@example.com',
          };
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // This is the correct place to set up the token refresh handler.
        keycloak.onTokenExpired = () => {
          keycloak
            .updateToken(30)
            .then((refreshed) => {
              if (refreshed) {
                setToken(keycloak.token ?? null);
              } else {
                console.warn('Token not refreshed, user might be logged out');
              }
            })
            .catch((err) => {
              console.error('Failed to refresh token', err);
            });
        };

      } catch (error) {
        console.error('Keycloak initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    // The keycloak object might be null if the component is rendered on the server.
    keycloak?.login();
  };

  const logout = () => {
    localStorage.removeItem('user');
    keycloak?.logout();
  };

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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
