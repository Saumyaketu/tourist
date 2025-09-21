require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { writeIdentityHash, getLedger } = require('./blockchain');

const app = express();
app.use(bodyParser.json());

let touristsCollection;

async function connectToMongo() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('tourist_safety');
    touristsCollection = db.collection('tourists');
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    process.exit(1);
  }
}

// Ensure connection before starting the server
connectToMongo();

app.post('/v1/register', async (req, res) => {
  const { name, kycPayload, itinerary, contact } = req.body;
  if (!name || !kycPayload) return res.status(400).json({ error: 'name and kycPayload required' });

  const touristRef = 'T-' + uuidv4();
  const kycHash = `hash-demo-${Date.now()}`;
  const tourist = { touristRef, name, kycHash, createdAt: new Date().toISOString(), itinerary, contact };
  
  try {
    await touristsCollection.insertOne(tourist);
    const chainEntry = writeIdentityHash(touristRef, kycHash); // keep the blockchain stub
    res.json({ touristRef, chainEntry });
  } catch (e) {
    console.error('Error inserting tourist:', e);
    res.status(500).json({ error: 'Failed to register tourist' });
  }
});

app.get('/v1/tourists', async (req, res) => {
  try {
    const items = await touristsCollection.find().toArray();
    res.json({ items });
  } catch (e) {
    console.error('Error fetching tourists:', e);
    res.status(500).json({ error: 'Failed to fetch tourists' });
  }
});

app.get('/v1/ledger', (req, res) => {
  res.json({ entries: getLedger() });
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => console.log(`Identity service listening on ${PORT}`));