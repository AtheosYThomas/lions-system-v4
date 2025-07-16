
import express from 'express';
import { config } from '../config/config';
import { Client } from '@line/bot-sdk';

const router = express.Router();
const client = new Client({
  channelAccessToken: config.line.accessToken,
  channelSecret: config.line.channelSecret
});

router.post('/push/:userId', async (req, res) => {
  const { userId } = req.params;
  const { message } = req.body;

  try {
    await client.pushMessage(userId, {
      type: 'text',
      text: message || '這是系統推播測試訊息'
    });
    res.json({ status: 'success' });
  } catch (err) {
    console.error('❌ 推播失敗:', err);
    res.status(500).json({ error: '推播失敗' });
  }
});

export default router;
