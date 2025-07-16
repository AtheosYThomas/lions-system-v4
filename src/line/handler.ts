
import { Request, Response } from 'express';
import { WebhookEvent, Client } from '@line/bot-sdk';
import { config } from '../config/config';

const client = new Client(config);

const lineHandler = async (req: Request, res: Response) => {
  try {
    console.log('📩 收到 Webhook 請求');
    console.log('📦 Request body =', JSON.stringify(req.body, null, 2));

    const events: WebhookEvent[] = req.body.events || [];
    console.log('📦 收到事件數量 =', events.length);

    const promises = events.map(async (event) => {
      try {
        console.log('🔍 處理事件類型 =', event.type);

        if (event.type === 'message' && event.message.type === 'text') {
          const userMsg = event.message.text;
          console.log('🗣️ 使用者訊息 =', userMsg);

          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: `你說的是：${userMsg}`,
          });

          console.log('✅ 回覆訊息成功');
        } else {
          console.log('📭 跳過非文字訊息事件');
        }
      } catch (eventErr) {
        console.error('❌ 單一事件處理錯誤 =', eventErr);
      }
    });

    // ✅ 等待所有事件完成
    await Promise.all(promises);
    res.status(200).end(); // ✅ 告訴 LINE 成功處理了
  } catch (err) {
    console.error('❌ handler.ts 總體錯誤：', err);
    res.status(500).end(); // ❌ 出錯才回 500
  }
};

export default lineHandler;
