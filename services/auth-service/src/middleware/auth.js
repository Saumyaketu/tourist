// services/auth-service/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me';

function verifyTokenMiddleware(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  if (!auth) return res.status(401).json({ error: 'Authorization header required' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Malformed authorization header' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { id: payload.sub, jwtPayload: payload };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { verifyTokenMiddleware };