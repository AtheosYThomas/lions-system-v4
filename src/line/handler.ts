
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

    // 簡單回應測試
    console.log('✅ Webhook 收到請求，回傳 200 OK');
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    
  } catch (err) {
    console.error('❌ handler.ts 總體錯誤：', err);
    res.status(200).json({ status: 'error', error: err.message }); // 改為回傳 200
  }
};

export default lineHandler;
