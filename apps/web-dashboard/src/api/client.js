import axios from "axios";

const API_BASE = "/"; 

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { "Content-Type": "application/json" }
});

// --- Identity Service Client (using proxy /identity-api) ---
const identityApi = axios.create({
  // This URL path should be proxied to Identity Service (e.g., http://localhost:4100/v1)
  baseURL: '/identity-api', 
  timeout: 8000,
  headers: { "Content-Type": "application/json" }
});
// ------------------------------------

// Alerts 
export async function getAlerts() {
  const r = await api.get("/v1/alerts");
  return r.data;
}

export async function acknowledgeAlert(alertId) {
  const r = await api.post(`/v1/alerts/${encodeURIComponent(alertId)}/ack`, {});
  return r.data;
}

// Tourists
export async function getTourists() {
  const r = await api.get("/v1/tourists");
  return r.data;
}

// Tourist Details (Uses Identity API proxy to fetch full record)
export async function getTouristDetails(id) {
  if (!id) throw new Error('getTouristDetails requires id');
  // Identity Service endpoint for details is /v1/tourists/:id, mapped via proxy rewrite
  const r = await identityApi.get(`/tourists/${encodeURIComponent(id)}`);
  return r.data; // Expected format: { tourist: {...} }
}

// Panic (admin action)
export async function sendPanicTo(touristRef) {
  // Not used in the current UI, but available
  const r = await api.post("/v1/panic/manual", { touristRef });
  return r.data;
}

// Map Data (Dashboard API)
export async function getLocations() {
  const r = await api.get("/v1/locations");
  return r.data;
}

export default api;