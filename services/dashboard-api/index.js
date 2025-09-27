require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let touristsCollection, alertsCollection, locationsCollection;

async function connectToMongo() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB;

  if (!uri) {
    console.error("MONGO_URI environment variable is not set.");
    process.exit(1);
  }
  if (!dbName) { 
    console.error("MONGO_DB environment variable is not set.");
    process.exit(1);
  }
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName); 
    touristsCollection = db.collection('tourists');
    alertsCollection = db.collection('alerts');
    locationsCollection = db.collection('locations');
    console.log(`Dashboard API connected to MongoDB database: ${dbName}`);
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    process.exit(1);
  }
}

connectToMongo();

app.get('/v1/tourists', async (req, res) => {
  try {
    const items = await touristsCollection.find().toArray();
    res.json({ items });
  } catch (e) {
    console.error('Error fetching tourists:', e);
    res.status(500).json({ error: 'Failed to fetch tourists' });
  }
});

app.get('/v1/alerts', async (req, res) => {
  try {
    const alerts = await alertsCollection.find({ acknowledged: false }).sort({ timestamp: -1 }).toArray();
    res.json({ items: alerts });
  } catch (e) {
    console.error('Error fetching alerts:', e);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.post('/v1/alerts/:id/ack', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await alertsCollection.updateOne({ id }, { $set: { acknowledged: true } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ status: 'ok' });
  } catch (e) {
    console.error('Error acknowledging alert:', e);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

app.get('/v1/locations', async (req, res) => {
  try {
    const locations = await locationsCollection.find().sort({ timestamp: -1 }).limit(100).toArray();
    res.json({ items: locations });
  } catch (e) {
    console.error('Error fetching locations:', e);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => console.log(`Dashboard API listening on ${PORT}`));