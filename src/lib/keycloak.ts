import Keycloak from 'keycloak-js';

// This check ensures Keycloak is only initialized on the client-side.
const keycloak = typeof window !== 'undefined' ? new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
}) : undefined;


export default keycloak;
