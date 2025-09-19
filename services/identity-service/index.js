const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { writeIdentityHash, getLedger } = require('./blockchain');

const app = express();
app.use(bodyParser.json());

// In-memory store for demo
const tourists = {}; // touristRef -> { name, kycHash, createdAt, itinerary }

app.post('/v1/register', (req, res) => {
  const { name, kycPayload, itinerary, contact } = req.body;
  if (!name || !kycPayload) return res.status(400).json({ error: 'name and kycPayload required' });

  // In production: store encrypted KYC in object store and write hash to blockchain.
  const touristRef = 'T-' + uuidv4();
  const kycHash = `hash-demo-${Date.now()}`;

  tourists[touristRef] = { name, kycHash, createdAt: new Date().toISOString(), itinerary, contact };
  const chainEntry = writeIdentityHash(touristRef, kycHash);

  res.json({ touristRef, chainEntry });
});

app.get('/v1/tourists', (req, res) => {
  const items = Object.entries(tourists).map(([ref, v]) => ({ touristRef: ref, ...v }));
  res.json({ items });
});

app.get('/v1/ledger', (req, res) => {
  res.json({ entries: getLedger() });
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => console.log(`Identity service listening on ${PORT}`));
