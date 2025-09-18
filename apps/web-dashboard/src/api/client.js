import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { "Content-Type": "application/json" }
});

// Alerts
export async function getAlerts() {
  const r = await api.get("/v1/alerts");
  return r.data;
}

export async function acknowledgeAlert(alertId) {
  // demo endpoint (adjust on backend)
  const r = await api.post(`/v1/alerts/${alertId}/ack`, {});
  return r.data;
}

// Tourists
export async function getTourists() {
  const r = await api.get("/v1/tourists");
  return r.data;
}

// Panic (admin action)
export async function sendPanicTo(touristRef) {
  const r = await api.post("/v1/panic/manual", { touristRef });
  return r.data;
}

export default api;
