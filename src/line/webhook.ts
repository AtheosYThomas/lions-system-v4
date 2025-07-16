import express from 'express';
import { middleware } from '@line/bot-sdk';
import config from '../config/config';
import lineHandler from './handler';

const router = express.Router();

// LINE webhook POST 事件處理
router.post('/', middleware({ channelSecret: config.channelSecret }), async (req, res) => {
  try {
    console.log('📨 收到 LINE webhook 請求');
    await lineHandler(req, res);
  } catch (error) {
    console.error('🔥 Webhook 處理錯誤:', error);
    // LINE webhook 必須回傳 200，否則會顯示錯誤
    if (!res.headersSent) {
      res.status(200).send('OK');
    }
  }
});

export default router;