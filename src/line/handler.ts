
import { Request, Response } from 'express';
import { WebhookEvent, Client } from '@line/bot-sdk';
import config from '../config';

const client = new Client(config);

const lineHandler = async (req: Request, res: Response) => {
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

    res.status(200).end();
  } catch (err) {
    console.error("🔥 webhook 總錯誤：", err);
    res.status(200).end();
  }
};

export default lineHandler;
