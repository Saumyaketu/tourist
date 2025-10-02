export const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:4300';

export const DASHBOARD_API_URL =
  process.env.DASHBOARD_API_URL || process.env.REACT_APP_DASHBOARD_API_URL || 'http://localhost:4200';

export const LOCATION_AGENT_URL =
  process.env.LOCATION_AGENT_URL || process.env.REACT_APP_LOCATION_AGENT_URL || 'http://localhost:4000';

// helper header
export function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}