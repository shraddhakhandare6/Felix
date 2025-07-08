
import Keycloak from 'keycloak-js';
import type { KeycloakConfig } from 'keycloak-js';

let keycloak: Keycloak | null = null;

if (typeof window !== 'undefined') {
  const keycloakConfig: KeycloakConfig = {
    // url: process.env.NEXT_PUBLIC_KEYCLOAK_URL!,
    // realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
    // clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
    url:"https://iam-uat.cateina.com",
    realm: "Felix",
    clientId: "react-app",
  };
  
  // The AuthProvider will handle the case where these are missing.
  if (keycloakConfig.url && keycloakConfig.realm && keycloakConfig.clientId) {
     keycloak = new Keycloak(keycloakConfig);
  }
}

export default keycloak;
