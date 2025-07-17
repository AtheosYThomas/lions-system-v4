
import { Request, Response } from 'express';
import { WebhookEvent, Client } from '@line/bot-sdk';
import { config } from '../config/config';
import MessageLog from '../models/messageLog';
import Member from '../models/member';

const client = new Client({
  channelAccessToken: config.line.accessToken,
  channelSecret: config.line.channelSecret
});

const lineHandler = async (req: Request, res: Response) => {
  try {
    console.log('📩 收到 Webhook 請求');
    console.log('📦 Request body =', JSON.stringify(req.body, null, 2));

    const events: WebhookEvent[] = req.body.events;
    
    if (!events || events.length === 0) {
      console.log('✅ Webhook 驗證請求，回傳 200 OK');
      return res.status(200).send('OK');
    }

    // 處理實際的 LINE 事件
    for (const event of events) {
      console.log('📨 處理事件:', event.type);
      
      if (event.type === 'message' && event.message.type === 'text') {
        // 基本訊息回應
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `收到您的訊息: ${event.message.text}`
        });
      }
    }

    res.status(200).send('OK');
    
  } catch (err) {
    console.error('❌ handler.ts 總體錯誤：', err);
    res.status(200).send('OK'); // LINE webhook 必須回傳 200
  }
};

export default lineHandler;
