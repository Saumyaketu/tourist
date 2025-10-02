// services/auth-service/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userStore = require('../models/userStore');

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me';
const TOKEN_TTL = process.env.AUTH_TOKEN_TTL || '7d';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-admin-secret'; // used to protect delete endpoint

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

// Helper to redact sensitive fields when returning user
function redactUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  // prefer returning id, name, email, phone, temporaryPassword boolean
  return {
    id: rest.id,
    name: rest.name || rest.full_name || null,
    email: rest.email || rest.primary_email || null,
    phone: rest.phone || rest.primary_phone || null,
    temporaryPassword: !!rest.temporaryPassword,
    createdAt: rest.createdAt,
    updatedAt: rest.updatedAt,
    _id: rest._id
  };
}

// Register new user
exports.register = async function register(req, res, next) {
  try {
    const body = req.body || {};
    const { id, password, temporaryPassword = true, email, phone, name } = body;
    if (!id || !password) return res.status(400).json({ error: 'id and password are required' });

    const existing = await userStore.getUserById(id);
    if (existing) return res.status(409).json({ error: 'User id already exists' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userDoc = {
      id,
      passwordHash,
      temporaryPassword: !!temporaryPassword,
      name: name || null,
      email: email || null,
      phone: phone || null
    };

    const created = await userStore.createUser(userDoc);
    return res.status(201).json({ user: redactUser(created) });
  } catch (err) {
    next(err);
  }
};

// Login
exports.login = async function login(req, res, next) {
  try {
    const body = req.body || {};
    const { id, password } = body;
    if (!id || !password) return res.status(400).json({ error: 'id and password required' });

    const user = await userStore.getUserById(id);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT
    const payload = { sub: user.id, name: user.name || null };
    const token = jwt.sign(payload, AUTH_SECRET, { expiresIn: TOKEN_TTL });

    // Return token and user (redacted)
    return res.json({ token, user: redactUser(user) });
  } catch (err) {
    next(err);
  }
};

// change-password (authenticated)
exports.changePassword = async function changePassword(req, res, next) {
  try {
    const body = req.body || {};
    const { currentPassword, newPassword } = body;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword and newPassword required' });

    const user = await userStore.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const updated = await userStore.updateUser(userId, { passwordHash: newHash, temporaryPassword: false });
    return res.json({ success: true, user: redactUser(updated) });
  } catch (err) {
    next(err);
  }
};

// get /v1/users/me (authenticated)
exports.getMe = async function getMe(req, res, next) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const user = await userStore.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: redactUser(user) });
  } catch (err) {
    next(err);
  }
};

// Delete user (admin-protected by x-admin-secret header)
exports.deleteUser = async function deleteUser(req, res, next) {
  try {
    const adminHeader = req.headers['x-admin-secret'] || req.query.admin_secret || '';
    if (ADMIN_SECRET && adminHeader !== ADMIN_SECRET) {
      return res.status(403).json({ error: 'Admin secret required to delete users' });
    }
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'id param required' });

    const ok = await userStore.deleteUser(id);
    if (!ok) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
};