
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useRouter, usePathname } from 'next/navigation';
import type { KeycloakProfile } from 'keycloak-js';
import { PageLoader } from '@/components/page-loader';
import { useUser } from './user-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

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
  const [isKeycloakReady, setIsKeycloakReady] = useState(false);

  // This effect checks if the keycloak instance is functional.
  // The keycloak object from the library might be a dummy object if config is missing.
  useEffect(() => {
    if (initialized) {
      // A real keycloak instance will have an `authServerUrl`. A dummy one won't.
      if (keycloak && keycloak.authServerUrl) {
        setIsKeycloakReady(true);
      }
    }
  }, [initialized, keycloak]);


  useEffect(() => {
    if (initialized && keycloak && isKeycloakReady) {
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
          router.push('/login');
        }
      }
    }
  }, [initialized, keycloak, pathname, router, updateUser, isKeycloakReady]);

  const login = () => keycloak?.login();
  const logout = () => {
    localStorage.removeItem('user');
    keycloak?.logout();
  };
  
  if (!initialized) {
    return <PageLoader />;
  }

  // If keycloak isn't configured, show an error message on protected pages.
  if (initialized && !isKeycloakReady && !isPublicPage(pathname)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Alert variant="destructive" className="max-w-xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Authentication Not Configured</AlertTitle>
              <AlertDescription>
                <p>The application's authentication service is not configured. Please set the following environment variables:</p>
                <ul className="mt-2 list-disc list-inside font-mono text-xs">
                    <li>NEXT_PUBLIC_KEYCLOAK_URL</li>
                    <li>NEXT_PUBLIC_KEYCLOAK_REALM</li>
                    <li>NEXT_PUBLIC_KEYCLOAK_CLIENT_ID</li>
                </ul>
              </AlertDescription>
            </Alert>
        </div>);
  }
  
  // After initialization, if we are not authenticated and not on a public page, show a loader while we redirect.
  if (isKeycloakReady && !keycloak.authenticated && !isPublicPage(pathname)) {
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
