// services/location-agent/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const locationController = require('./controllers/locationController');

const app = express();
const PORT = process.env.PORT || 4000;
const BASE_PATH = '/v1';

// CORS - permissive for dev
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

// Routes
// Endpoint required by the Mobile Panic Button: GET /v1/locations/latest?touristId=ID
app.get(`${BASE_PATH}/locations/latest`, locationController.getLatestLocation);

// Health check
app.get(`${BASE_PATH}/healthz`, locationController.healthz);

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error in Location Agent:', err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Location Agent listening on http://localhost:${PORT}${BASE_PATH}`);
});