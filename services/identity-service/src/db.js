const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB;

// Internal holders
let client = null;
let dbInstance = null;

// In-memory fallback store: a map of collectionName -> array of documents
const inMemoryStore = {
  _collections: new Map(),
  collection(name) {
    if (!this._collections.has(name)) this._collections.set(name, []);
    const arr = this._collections.get(name);
    return {
      async insertOne(doc) {
        // create a pseudo ObjectId
        const insertedId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
        const copy = Object.assign({}, doc, { _id: insertedId });
        arr.push(copy);
        return { acknowledged: true, insertedId };
      },
      async find(query = {}) {
        // Return a simple cursor-like object with toArray
        const results = arr.filter(item => {
          // very simple matching: every key in query must equal item's key
          return Object.keys(query).every(k => {
            if (query[k] && typeof query[k] === 'object' && query[k].$eq !== undefined) {
              return item[k] === query[k].$eq;
            }
            return item[k] === query[k];
          });
        });
        return {
          toArray: async () => results.slice()
        };
      },
      async findOne(query = {}) {
        const found = arr.find(item => {
          return Object.keys(query).every(k => {
            return item[k] === query[k];
          });
        });
        return found || null;
      },
      async updateOne(filter = {}, update = {}) {
        const idx = arr.findIndex(item => {
          return Object.keys(filter).every(k => item[k] === filter[k]);
        });
        if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };
        // apply $set simple behavior
        if (update && update.$set) {
          arr[idx] = Object.assign({}, arr[idx], update.$set);
          return { matchedCount: 1, modifiedCount: 1, upsertedId: null };
        }
        return { matchedCount: 1, modifiedCount: 0 };
      }
    };
  }
};

async function connect() {
  // If already connected to Mongo, return client
  if (dbInstance && client) return client;

  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Attempting MongoDB connect to', uri, 'db:', dbName);
    await client.connect();
    dbInstance = client.db(dbName);
    console.log('MongoDB connected');
    return client;
  } catch (err) {
    console.warn('MongoDB connect failed — using in-memory fallback for dev. Error:', err && err.message);
    // clear any partially initialized client
    client = null;
    dbInstance = null;
    return null;
  }
}

async function getDb() {
  if (dbInstance) return dbInstance;
  // try connect; if fail, return null (caller should fall back)
  try {
    await connect();
    if (dbInstance) return dbInstance;
    return null;
  } catch (err) {
    console.warn('getDb: connect failed, returning null (in-memory fallback may be used)', err && err.message);
    return null;
  }
}

async function getCollection(name) {
  // Try Mongo first
  try {
    const db = await getDb();
    if (db) {
      return db.collection(name);
    }
  } catch (err) {
    console.warn('getCollection: Mongo access error:', err && err.message);
  }

  // Fall back to in-memory collection adapter
  console.log(`Using in-memory collection fallback for "${name}"`);
  return inMemoryStore.collection(name);
}

module.exports = { connect, getDb, getCollection };
