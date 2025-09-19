const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

// In production wire up Twilio / Firebase / email provider
app.post('/v1/notify', async (req, res) => {
  const { to, channel = 'sms', message, webhook } = req.body;
  console.log(`Notify[${channel}] -> ${to}: ${message}`);

  // optional webhook proxy
  if (webhook) {
    try {
      await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, message }) });
    } catch (e) {
      console.warn('webhook notify failed', e.message);
    }
  }

  res.json({ status: 'sent', channel, to });
});

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => console.log(`Notification service listening on ${PORT}`));
