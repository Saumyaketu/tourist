require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

let alertsCollection, locationsCollection;

async function connectToMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI environment variable is not set.");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('tourist_safety');
    alertsCollection = db.collection('alerts');
    locationsCollection = db.collection('locations');
    console.log("Location-Ingest connected to MongoDB Atlas");
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    process.exit(1);
  }
}

connectToMongo();

app.post('/v1/location', async (req, res) => {
  const { deviceId, timestamp, lat, lon, touristRef } = req.body;
  if (!deviceId || lat == null || lon == null) {
    return res.status(400).json({ error: 'deviceId, lat, lon required' });
  }
  const ping = { id: uuidv4(), deviceId, timestamp: timestamp || new Date().toISOString(), lat, lon, touristRef };
  try {
    await locationsCollection.insertOne(ping);
    res.json({ status: 'ok' });
  } catch (e) {
    console.error('Error inserting location:', e);
    res.status(500).json({ error: 'Failed to save location' });
  }
});

app.post('/v1/panic', async (req, res) => {
  const { deviceId, lat, lon, timestamp, touristRef } = req.body;
  const alert = { id: 'P-' + Date.now(), type: 'PANIC', severity: 'CRITICAL', location: { lat, lon }, deviceId, touristRef, timestamp: timestamp || new Date().toISOString(), acknowledged: false };
  try {
    await alertsCollection.insertOne(alert);
    console.log('Panic alert added', alert);
    res.json({ status: 'panic_received', alertId: alert.id });
  } catch (e) {
    console.error('Error inserting panic alert:', e);
    res.status(500).json({ error: 'Failed to save panic alert' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Location ingest service listening on ${PORT}`));