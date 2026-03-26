import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://unrefrained-primal-harlee.ngrok-free.dev',
  realm: 'aeme',
  clientId: 'frontend-aeme',
});

export default keycloak;