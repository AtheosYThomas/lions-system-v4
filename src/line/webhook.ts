
import express from 'express';
import { middleware, WebhookEvent, Client } from '@line/bot-sdk';
import config from '../config';

const router = express.Router();

// 防呆 log
console.log("🛠 webhook.ts 已載入");
console.log("🔐 config.channelAccessToken:", typeof config.channelAccessToken, config.channelAccessToken?.slice(0, 10));
console.log("🔐 config.channelSecret:", typeof config.channelSecret, config.channelSecret?.slice(0, 10));

let client: Client;

try {
  client = new Client(config);
} catch (e) {
  console.error("❌ LINE Client 初始化失敗：", e);
}

try {
  router.use(middleware(config));
} catch (err) {
  console.error("❌ middleware 初始化失敗：", err);
}

router.post('/', async (req, res) => {
  try {
    const events: WebhookEvent[] = req.body?.events || [];
    console.log("📨 收到事件數量:", events.length);

    // ✅ LINE 規定：一定要先回應 200，否則會失敗
    res.status(200).end();

    // 處理每個事件
    for (const event of events) {
      try {
        console.log("➡️ 處理事件類型:", event.type);

        if (event.type === 'message' && event.message.type === 'text') {
          const msg = event.message.text;
          console.log("💬 使用者傳來：", msg);

          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: `你說的是：「${msg}」`,
          });
        }
      } catch (inner) {
        console.error("⚠️ 單一事件處理錯誤：", inner);
      }
    }

  } catch (err) {
    console.error("🔥 webhook handler 錯誤（外層）:", err);
    // ✅ 永遠回 200
    res.status(200).end();
  }
});

export default router;
