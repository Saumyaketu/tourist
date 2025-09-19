/**
 * Simple anomaly consumer (polling demo)
 * - Flags consecutive identical locations as NO_MOVEMENT
 * - Flags sudden large jumps as POSSIBLE_ABDUCTION (demo)
 */

const fetch = require('node-fetch');

const LOCATION_SERVICE = process.env.LOCATION_SERVICE || 'http://localhost:4000';
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || 3000);

let lastByDevice = {};

async function poll() {
  try {
    const res = await fetch(`${LOCATION_SERVICE}/v1/locations`);
    const json = await res.json();
    const pings = json.items || [];
    for (const p of pings) {
      const key = p.deviceId;
      if (!key) continue;
      const last = lastByDevice[key];
      if (last) {
        // no movement detection (same coords repeated)
        if (last.lat === p.lat && last.lon === p.lon && (Date.now() - new Date(last.timestamp).getTime()) > 5 * 60 * 1000) {
          const alert = { id: 'A-' + Date.now(), type: 'NO_MOVEMENT', severity: 'WARNING', location: { lat: p.lat, lon: p.lon }, deviceId: key, timestamp: new Date().toISOString() };
          await postAlert(alert);
        }

        // sudden jump detection (very naive)
        const d = distanceKm(last.lat, last.lon, p.lat, p.lon);
        const dtSec = (new Date(p.timestamp) - new Date(last.timestamp)) / 1000;
        if (dtSec > 0 && (d / (dtSec / 3600)) > 250) { // >250 km/h => suspicious
          const alert = { id: 'A-' + Date.now(), type: 'SUDDEN_JUMP', severity: 'HIGH', location: { lat: p.lat, lon: p.lon }, deviceId: key, lastLocation: last, timestamp: new Date().toISOString() };
          await postAlert(alert);
        }
      }
      lastByDevice[key] = p;
    }
  } catch (e) {
    console.error('poll error', e);
  }
}

async function postAlert(alert) {
  try {
    await fetch(`${LOCATION_SERVICE}/v1/_internal/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
    console.log('posted alert', alert.type, alert.id);
  } catch (e) {
    console.warn('post alert failed', e.message);
  }
}

function distanceKm(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some(v => v == null)) return 0;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

setInterval(poll, POLL_INTERVAL);
console.log('Anomaly consumer started. Polling', LOCATION_SERVICE, 'every', POLL_INTERVAL, 'ms');
poll();
