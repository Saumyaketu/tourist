const { createApp } = require('./src/app');
const db = require('./src/db');

const PORT = process.env.PORT || 4100;

async function start() {
  try {
    await db.connect();
  } catch (err) {
    console.warn('DB connect failed (continuing in dev):', err && err.message);
  }
  const app = createApp();
  app.listen(PORT, () => console.log(`Identity service listening on ${PORT}`));
}

start().catch(err => {
  console.error('Failed to start identity service', err);
  process.exit(1);
});
