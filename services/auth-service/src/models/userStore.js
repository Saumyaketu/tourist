// services/auth-service/src/models/userStore.js
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || '';
const MONGO_DB = process.env.MONGO_DB || 'smarttourist_auth';

let mongoClient = null;
let mongoDb = null;

const inMemoryUsers = new Map();

async function connectMongo() {
  if (!MONGO_URI) return null;
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    await mongoClient.connect();
    mongoDb = mongoClient.db(MONGO_DB);
  }
  return mongoDb;
}

async function createUser(user) {
  // user must include { id, passwordHash, temporaryPassword?, name?, email?, phone? }
  const db = await connectMongo();
  if (db) {
    const col = db.collection('users');
    // unique index on id recommended externally
    const now = new Date();
    const doc = { ...user, createdAt: now, updatedAt: now };
    const res = await col.insertOne(doc);
    return res.insertedId ? { ...doc, _id: res.insertedId } : doc;
  }
  // in-memory
  const now = new Date();
  const u = { ...user, createdAt: now, updatedAt: now, _id: (Math.random() + Date.now()).toString(36) };
  inMemoryUsers.set(user.id, u);
  return u;
}

async function getUserById(id) {
  const db = await connectMongo();
  if (db) {
    const col = db.collection('users');
    const doc = await col.findOne({ id });
    return doc;
  }
  return inMemoryUsers.get(id) || null;
}

async function updateUser(id, patch) {
  const db = await connectMongo();
  if (db) {
    const col = db.collection('users');
    const update = { $set: { ...patch, updatedAt: new Date() } };
    const res = await col.findOneAndUpdate({ id }, update, { returnDocument: 'after' });
    return res.value;
  }
  const u = inMemoryUsers.get(id);
  if (!u) return null;
  const updated = { ...u, ...patch, updatedAt: new Date() };
  inMemoryUsers.set(id, updated);
  return updated;
}

async function deleteUser(id) {
  const db = await connectMongo();
  if (db) {
    const col = db.collection('users');
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  }
  const existed = inMemoryUsers.delete(id);
  return existed;
}

/**
 * find one by predicate function (in-memory only) or by query object (mongo)
 * For small uses only.
 */
async function findByPredicate(predicate) {
  const db = await connectMongo();
  if (db) {
    const col = db.collection('users');
    const doc = await col.findOne(predicate);
    return doc;
  }
  for (const u of inMemoryUsers.values()) {
    if (predicate(u)) return u;
  }
  return null;
}

module.exports = { createUser, getUserById, updateUser, deleteUser, findByPredicate };