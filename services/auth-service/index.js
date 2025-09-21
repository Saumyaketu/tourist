const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

const SECRET = process.env.AUTH_SECRET || 'dev-secret';

// demo users
const USERS = { admin: { password: 'adminpass', role: 'admin' } };

app.post('/v1/login', (req, res) => {
  const { username, password } = req.body;
  const u = USERS[username];
  if (!u || u.password !== password) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ username, role: u.role }, SECRET, { expiresIn: '8h' });
  res.json({ token });
});

app.get('/v1/verify', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'no token' });
  const token = auth.replace(/^Bearer\s+/i, '');
  try {
    const payload = jwt.verify(token, SECRET);
    res.json({ ok: true, payload });
  } catch (e) {
    res.status(401).json({ error: 'invalid token' });
  }
});

const PORT = process.env.PORT || 4300;
app.listen(PORT, () => console.log(`Auth service listening on ${PORT}`));
