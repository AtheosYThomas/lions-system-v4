
import express from 'express';
import { config } from '../config/config';
import { Client, middleware, validateSignature } from '@line/bot-sdk';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';

const router = express.Router();

const lineClient = new Client({
  channelAccessToken: config.line.accessToken,
  channelSecret: config.line.channelSecret,
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-line-signature'];
  const body = req.body;

  const isValid = validateSignature(body, config.line.channelSecret, signature as string);
  if (!isValid) {
    return res.status(401).send('Unauthorized');
  }

  const events = JSON.parse(body.toString()).events;
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      await sequelize.query(
        'INSERT INTO message_logs (id, user_id, timestamp, message_type, message_content) VALUES (?, ?, NOW(), ?, ?)',
        {
          replacements: [uuidv4(), event.source.userId, 'text', event.message.text],
        }
      );
    }
  }

  res.status(200).send('OK');
});

export default router;
