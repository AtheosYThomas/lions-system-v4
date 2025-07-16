import express from 'express';
import { middleware, WebhookEvent, Client } from '@line/bot-sdk';
import config from '../config';

const router = express.Router();
const client = new Client(config);

// ✅ middleware 放最前面
router.use(middleware(config));

// ✅ 保底式處理，永遠回 200
router.post('/', async (req, res) => {
  try {
    const events: WebhookEvent[] = req.body.events || [];
    console.log("📩 收到事件數量:", events.length);

    for (const event of events) {
      try {
        if (event.type === 'message' && event.message.type === 'text') {
          const userMsg = event.message.text;
          console.log("💬 使用者訊息：", userMsg);

          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: `你說的是：「${userMsg}」`,
          });
        }
      } catch (eventErr) {
        console.error("⚠️ 單一事件處理錯誤：", eventErr);
      }
    }

    res.status(200).end(); // ✅ 無論如何回 200
  } catch (err) {
    console.error("🔥 webhook 總錯誤：", err);
    res.status(200).end(); // ✅ 避免報 500
  }
});

export default router;