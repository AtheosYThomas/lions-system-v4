import express from 'express';
import { middleware, WebhookEvent, Client } from '@line/bot-sdk';
import config from '../config';

const router = express.Router();
const client = new Client(config);

// Middleware 若失敗也不中斷系統
try {
  router.use(middleware(config));
} catch (err) {
  console.error("❌ Middleware 初始化錯誤（不影響回應 200）:", err);
}

// 主處理函數：不管什麼錯都回 200，避免 webhook 驗證失敗
router.post('/', async (req, res) => {
  try {
    const events: WebhookEvent[] = req.body.events;
    console.log('📥 收到事件：', JSON.stringify(events, null, 2));

    for (const event of events) {
      // 範例：僅回覆文字訊息
      if (event.type === 'message' && event.message.type === 'text') {
        const userText = event.message.text;
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `你說：「${userText}」`,
        });
      }
    }

    res.status(200).end(); // ✅ 一律回傳 200
  } catch (err) {
    console.error("🔥 webhook 處理錯誤（但仍回 200）:", err);
    res.status(200).end(); // ✅ 即使有錯也不回 500
  }
});

export default router;