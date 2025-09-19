const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const LOCATION_SERVICE = process.env.LOCATION_SERVICE || 'http://localhost:4000';
const IDENTITY_SERVICE = process.env.IDENTITY_SERVICE || 'http://localhost:4100';

app.get('/v1/alerts', async (req, res) => {
  try {
    const r = await axios.get(`${LOCATION_SERVICE}/v1/alerts`);
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/v1/tourists', async (req, res) => {
  try {
    const r = await axios.get(`${IDENTITY_SERVICE}/v1/tourists`);
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 4300;
app.listen(PORT, () => console.log(`Dashboard API listening on ${PORT}`));
