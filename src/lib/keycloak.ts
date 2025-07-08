
import Keycloak from 'keycloak-js';
import type { KeycloakConfig } from 'keycloak-js';

// This file is executed on the server and the client.
// We only want to create a Keycloak instance on the client.
let keycloak: Keycloak | null = null;

if (typeof window !== 'undefined') {
  const keycloakConfig: KeycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
  };
  
  // The AuthProvider will handle the case where these are missing.
  if (keycloakConfig.url && keycloakConfig.realm && keycloakConfig.clientId) {
     keycloak = new Keycloak(keycloakConfig);
  }
}

export default keycloak;
