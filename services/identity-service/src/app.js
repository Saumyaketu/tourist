require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

let swaggerSpec = {};
try { 
  swaggerSpec = require('./swagger.json'); 
} catch (e) {
  /* ignore */ 
}

const touristRoutes = require('./routes/touristRoutes');

function createApp() {
  const app = express();
  app.use(morgan('dev'));

  // Explicit CORS headers middleware — returns headers for every request (including OPTIONS)
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    
    // Preflight cache TTL (seconds)
    res.setHeader('Access-Control-Max-Age', '600');
    
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  app.use(bodyParser.json({ limit: '2mb' }));

  // Mount routes
  app.use('/v1/tourists', touristRoutes);

  app.get('/v1/health', (req, res) => res.json({ status: 'ok', service: 'identity-service' }));

  if (Object.keys(swaggerSpec).length) {
    const swaggerUi = require('swagger-ui-express');
    app.use('/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  // Generic error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error', err && err.stack || err);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: err && err.message ? err.message : 'internal error' });
  });

  return app;
}

module.exports = { createApp };
