import Keycloak from 'keycloak-js';

// Define a type for our Keycloak configuration
type KeycloakConfig = {
  url: string;
  realm: string;
  clientId: string;
};

// Validate environment variables
function getKeycloakConfig(): KeycloakConfig | null {
  const url = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

  if (!url || !realm || !clientId) {
    return null;
  }

  return {
    url,
    realm,
    clientId,
  };
}

// Conditionally instantiate Keycloak to prevent crashes when config is missing.
// The AuthProvider will handle the unconfigured state.
const config = getKeycloakConfig();
const keycloak = config ? new Keycloak(config) : {} as Keycloak;


export default keycloak;
