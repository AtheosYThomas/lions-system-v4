
import express from 'express';
import { config } from '../config/config';
import { Client, middleware, validateSignature } from '@line/bot-sdk';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';
import MessageLog from '../models/messageLog';

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
      try {
        await MessageLog.create({
          user_id: event.source.userId,
          message_type: 'text',
          message_content: event.message.text
        });
      } catch (error) {
        console.error('Error saving message log:', error);
      }
    }
  }

  res.status(200).send('OK');
});

export default router;
