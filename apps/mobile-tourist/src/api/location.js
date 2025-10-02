// apps/mobile-tourist/src/api/location.js
import { LOCATION_AGENT_URL, DASHBOARD_API_URL, authHeader } from './config';

// Helper to handle all JSON responses
async function handle(res) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = body?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.payload = body;
    throw err;
  }
  return body;
}

// ----------------------------------------------------------------
// Existing Function (Fetching stale location)
// ----------------------------------------------------------------
export async function getLatestLocation(touristId, token) {
  const url = `${LOCATION_AGENT_URL}/v1/locations/latest?touristId=${encodeURIComponent(touristId)}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return handle(res);
}

// ----------------------------------------------------------------
// NEW Function: Sends a live panic alert to the Dashboard API
// ----------------------------------------------------------------
export async function sendPanicAlert(token, touristId, locationData) {
  const url = `${DASHBOARD_API_URL}/v1/alerts`; // POST endpoint on Dashboard API (4200)

  const body = {
    touristId: touristId,
    type: 'PANIC',
    status: 'ACTIVE',
    ...locationData,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
    },
    body: JSON.stringify(body),
  });

  return handle(res);
}