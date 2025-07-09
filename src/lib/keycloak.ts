import Keycloak from 'keycloak-js';

// Define a type for our Keycloak configuration
type KeycloakConfig = {
  url: string;
  realm: string;
  clientId: string;
};

// Validate environment variables
function getKeycloakConfig(): KeycloakConfig {
  const url = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

  if (!url || !realm || !clientId) {
    throw new Error('Keycloak configuration is missing. Please check your environment variables.');
  }

  return {
    url,
    realm,
    clientId,
  };
}

const keycloak = new Keycloak(getKeycloakConfig());

export default keycloak;