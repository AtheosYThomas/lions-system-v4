
import express from 'express';
import { middleware, WebhookEvent } from '@line/bot-sdk';
import { config } from '../config/config';
import MessageLog from '../models/messageLog';

const router = express.Router();

// LINE Bot 設定
const lineConfig = {
  channelAccessToken: config.line.accessToken,
  channelSecret: config.line.channelSecret,
};

// 事件處理函數
async function handleEvent(event: WebhookEvent) {
  try {
    // 檢查事件來源
    if (!event.source?.userId) {
      console.warn('Event without userId:', event.type);
      return;
    }

    if (event.type === 'message' && event.message.type === 'text') {
      await MessageLog.create({
        user_id: event.source.userId,
        message_type: 'text',
        message_content: event.message.text
      });
    } else if (event.type === 'message') {
      // 處理其他類型的訊息
      await MessageLog.create({
        user_id: event.source.userId,
        message_type: event.message.type,
        message_content: JSON.stringify(event.message)
      });
    }
  } catch (error) {
    console.error('Error processing event:', error, 'Event:', event);
  }
}

// Middleware 檢查簽名
router.post('/webhook', middleware(lineConfig), async (req, res) => {
  try {
    const events: WebhookEvent[] = req.body.events;

    if (events.length === 0) {
      // 空事件直接回傳 200
      return res.status(200).send('OK');
    }

    // 處理每個事件（可用 Promise.all 處理多個）
    await Promise.all(events.map(event => handleEvent(event)));

    // 成功後一定回 200
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Webhook 處理錯誤：', error);

    // 即使錯誤也回 200，避免 LINE 關閉 webhook
    res.status(200).send('OK');
  }
});

export default router;
