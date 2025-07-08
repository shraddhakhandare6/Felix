
import Keycloak from 'keycloak-js';
import type { KeycloakConfig } from 'keycloak-js';

let keycloak: Keycloak | null = null;

if (typeof window !== 'undefined') {
  const keycloakConfig: KeycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  };
  
  if (keycloakConfig.url && keycloakConfig.realm && keycloakConfig.clientId) {
     keycloak = new Keycloak(keycloakConfig);
  } else {
    console.error('Keycloak is not configured. Please provide NEXT_PUBLIC_KEYCLOAK_URL, NEXT_PUBLIC_KEYCLOAK_REALM, and NEXT_PUBLIC_KEYCLOAK_CLIENT_ID in your environment.');
  }
}

export default keycloak;
