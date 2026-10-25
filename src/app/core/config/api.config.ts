const LOCAL_API_BASE_URL = 'http://localhost:8787/api';
const PRODUCTION_API_BASE_URL = 'https://api.rakawik.my.id/api';

// Local dev talks to `wrangler dev`; every deployed host talks to the production Worker.
const localHosts = new Set(['localhost', '127.0.0.1']);

export const API_BASE_URL = localHosts.has(window.location.hostname)
  ? LOCAL_API_BASE_URL
  : PRODUCTION_API_BASE_URL;
