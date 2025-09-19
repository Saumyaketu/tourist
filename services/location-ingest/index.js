const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

// Simple in-memory buffers (demo)
const locationBuffer = []; // recent pings
let alerts = []; // alerts surfaced (anomaly/panic)

// POST location pings
// body: { deviceId, timestamp, lat, lon, touristRef? }
app.post('/v1/location', (req, res) => {
  const { deviceId, timestamp, lat, lon, touristRef } = req.body;
  if (!deviceId || lat == null || lon == null) return res.status(400).json({ error: 'deviceId, lat, lon required' });
  const ping = { id: uuidv4(), deviceId, timestamp: timestamp || new Date().toISOString(), lat, lon, touristRef };
  locationBuffer.push(ping);
  // keep last 1000
  if (locationBuffer.length > 2000) locationBuffer.shift();

  // In production: publish to Kafka topic 'location.pings'
  res.json({ status: 'ok' });
});

// HACK: expose for anomaly consumer
app.get('/v1/locations', (req, res) => {
  res.json({ items: locationBuffer.slice(-500) });
});

// Panic endpoint
app.post('/v1/panic', (req, res) => {
  const { deviceId, lat, lon, timestamp, touristRef } = req.body;
  const alert = { id: 'P-' + Date.now(), type: 'PANIC', severity: 'CRITICAL', location: { lat, lon }, deviceId, touristRef, timestamp: timestamp || new Date().toISOString() };
  alerts.push(alert);
  console.log('panic alert added', alert);
  res.json({ status: 'panic_received', alertId: alert.id });
});

// Internal: accept alerts from anomaly service
app.post('/v1/_internal/alerts', (req, res) => {
  const a = req.body;
  a.id = a.id || 'A-' + Date.now();
  alerts.push(a);
  console.log('internal alert received', a);
  res.json({ status: 'alert_recorded' });
});

app.get('/v1/alerts', (req, res) => {
  res.json({ items: alerts.slice(-500) });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Location ingest service listening on ${PORT}`));
