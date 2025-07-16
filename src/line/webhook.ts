import express from 'express';
import { middleware, WebhookEvent } from '@line/bot-sdk';
import { config } from '../config/config';

const router = express.Router();

// LINE Bot 設定
const lineConfig = {
  channelAccessToken: config.line.accessToken,
  channelSecret: config.line.channelSecret,
};

// LINE Middleware 放在最前面
router.use(middleware(lineConfig));

router.post('/', async (req, res) => {
  res.status(200).end(); // 回傳 200 避免 LINE 偵錯錯誤

  const events: WebhookEvent[] = req.body.events;
  for (const event of events) {
    console.log('📥 LINE Event:', event);

    try {
      // 檢查事件來源
      if (!event.source?.userId) {
        console.warn('Event without userId:', event.type);
        continue;
      }

      if (event.type === 'message' && event.message.type === 'text') {
        console.log('收到文字訊息:', event.message.text);
        // 可在這裡處理文字訊息回覆
      } else if (event.type === 'message') {
        console.log('收到其他類型訊息:', event.message.type);
        // 處理其他類型的訊息
      }
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }
});

export default router;