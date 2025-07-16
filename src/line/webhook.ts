
import express from 'express';
import { middleware, WebhookEvent, Client, MiddlewareConfig } from '@line/bot-sdk';
import config from '../config';

const router = express.Router();
const client = new Client(config);

// middleware 設定，處理 LINE 傳入資料
const middlewareConfig: MiddlewareConfig = {
  channelSecret: config.channelSecret || ''
};

router.use(middleware(middlewareConfig));

// webhook 路由處理 POST /webhook
router.post('/', async (req, res) => {
  try {
    const events: WebhookEvent[] = req.body.events;
    res.status(200).end(); // 告知 LINE 我們收到請求了

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;
        console.log('📥 User Message:', userMessage);

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `你說的是：「${userMessage}」`,
        });
      }
    }
  } catch (err) {
    console.error('❌ Webhook error:', err);
    res.status(500).end();
  }
});

export default router;
