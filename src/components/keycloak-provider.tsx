'use client';

import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from '@/lib/keycloak';

export function KeycloakProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'check-sso',
        checkLoginIframe: false,
      }}
      LoadingComponent={<div>Loading...</div>}
      autoRefreshToken={true}
    >
      {children}
    </ReactKeycloakProvider>
  );
}
