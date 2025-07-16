
import { Request, Response } from 'express';
import { WebhookEvent, Client } from '@line/bot-sdk';
import config from '../config';

const client = new Client(config);

const lineHandler = async (req: Request, res: Response) => {
  try {
    console.log("📨 收到 webhook 請求");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));
    
    const events: WebhookEvent[] = req.body.events || [];
    console.log("📩 收到事件數量:", events.length);

    // 處理事件
    const promises = events.map(async (event) => {
      try {
        console.log("🔍 處理事件類型:", event.type);
        
        if (event.type === 'message' && event.message.type === 'text') {
          const userMsg = event.message.text;
          console.log("💬 使用者訊息：", userMsg);

          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: `你說的是：「${userMsg}」`,
          });
          
          console.log("✅ 回覆訊息成功");
        } else {
          console.log("ℹ️ 略過非文字訊息事件");
        }
      } catch (eventErr) {
        console.error("⚠️ 單一事件處理錯誤：", eventErr);
        // 不拋出錯誤，繼續處理其他事件
      }
    });

    // 等待所有事件處理完成
    await Promise.all(promises);

    // 確保回傳 200 狀態碼
    if (!res.headersSent) {
      res.status(200).send('OK');
    }
  } catch (err) {
    console.error("🔥 webhook 總錯誤：", err);
    // LINE webhook 必須回傳 200，否則會重試
    if (!res.headersSent) {
      res.status(200).send('OK');
    }
  }
};

export default lineHandler;
