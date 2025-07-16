
import express from 'express';
import { middleware, WebhookEvent, Client } from '@line/bot-sdk';
import config from '../config';

const router = express.Router();

console.log("🔐 LINE channelAccessToken:", config.channelAccessToken);
console.log("🔐 LINE channelSecret:", config.channelSecret);

// 嘗試建立 LINE 客戶端
let client: Client;
try {
  client = new Client(config);
} catch (err) {
  console.error("❌ Failed to initialize LINE Client:", err);
}

try {
  router.use(middleware({
    channelSecret: config.channelSecret || ''
  }));
} catch (err) {
  console.error("❌ LINE Middleware 設定錯誤，請檢查 config.ts 與環境變數：", err);
}

// Webhook 主處理
router.post('/', async (req, res) => {
  try {
    const events: WebhookEvent[] = req.body.events;
    console.log("📥 接收到事件：", JSON.stringify(events, null, 2));

    // 一定要先回應 200 給 LINE 平台
    res.status(200).end();

    for (const event of events) {
      console.log("➡️ 處理單一事件：", event.type);

      // 僅處理文字訊息事件
      if (event.type === 'message' && event.message.type === 'text') {
        const message = event.message.text;
        console.log("💬 來自用戶的訊息：", message);

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `你說的是：「${message}」`,
        });
      }
    }
  } catch (err) {
    console.error("🔥 處理 webhook 時發生錯誤：", err);
    res.status(500).end();
  }
});

export default router;
