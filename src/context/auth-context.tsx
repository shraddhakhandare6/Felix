
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useRouter, usePathname } from 'next/navigation';
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
  const { keycloak, initialized } = useKeycloak();
  const [userProfile, setUserProfile] = useState<KeycloakProfile | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const { updateUser } = useUser();

  useEffect(() => {
    if (initialized && keycloak) {
      if (keycloak.authenticated) {
        keycloak.loadUserProfile().then(profile => {
          setUserProfile(profile);
          if (profile.username && profile.email) {
            updateUser({ username: profile.username, email: profile.email });
          }
        });
        if (pathname === '/login') {
          router.push('/dashboard');
        }
      } else {
        setUserProfile(null);
        if (!isPublicPage(pathname)) {
          keycloak.login();
        }
      }
    }
  }, [initialized, keycloak, pathname, router, updateUser]);

  const login = () => keycloak?.login();
  const logout = () => {
    localStorage.removeItem('user');
    keycloak?.logout();
  };
  
  if (!initialized) {
    return <PageLoader />;
  }
  
  // After initialization, if we are not authenticated and not on a public page, show a loader while we redirect.
  if (!keycloak.authenticated && !isPublicPage(pathname)) {
    return <PageLoader />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!keycloak.authenticated, user: userProfile, login, logout, loading: !initialized }}>
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
