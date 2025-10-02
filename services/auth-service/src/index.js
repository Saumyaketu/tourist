// services/auth-service/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authController = require('./controllers/authController');
const { verifyTokenMiddleware } = require('./middleware/auth');

const app = express();

const PORT = process.env.PORT || 4300;
const BASE = '/v1';

// ========== CORS (dev) ===========
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-admin-secret'],
  credentials: true
}));

// ========== Body parser with JSON error handler ===========
app.use(bodyParser.json({ limit: '1mb' }));

// Intercept JSON parse errors and return JSON response
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

// ========== Routes ===========

// Basic health endpoint
app.get(`${BASE}/healthz`, (req, res) => {
  res.json({ ok: true, service: 'auth-service' });
});

// Auth routes
app.post(`${BASE}/auth/register`, authController.register);
app.post(`${BASE}/auth/login`, authController.login);

// Protected change-password
app.post(`${BASE}/auth/change-password`, verifyTokenMiddleware, authController.changePassword);

// Admin delete user (best-effort)
app.delete(`${BASE}/auth/users/:id`, authController.deleteUser);

// User endpoints
app.get(`${BASE}/users/me`, verifyTokenMiddleware, authController.getMe);

// Generic error handler -> JSON
app.use((err, req, res, next) => {
  console.error('Unhandled error', err && err.stack || err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth service listening on http://localhost:${PORT}${BASE}`);
});