import express from 'express';
import { middleware } from '@line/bot-sdk';
import { config } from '../config/config';
import lineHandler from './handler';

const router = express.Router();

// LINE webhook POST 事件處理 - 先不檢查 signature 用於測試
router.post('/', async (req, res) => {
  try {
    console.log('📨 收到 LINE webhook 請求');
    console.log('📋 Headers:', req.headers);
    console.log('📋 Body:', JSON.stringify(req.body, null, 2));
    
    // 檢查是否有 events
    if (!req.body || !req.body.events) {
      console.log('⚠️ 無效的請求格式');
      return res.status(200).json({ status: 'ok', message: 'no events' });
    }
    
    await lineHandler(req, res);
  } catch (error) {
    console.error('🔥 Webhook 處理錯誤:', error);
    // LINE webhook 必須回傳 200，否則會重複發送
    if (!res.headersSent) {
      res.status(200).json({ status: 'error', message: 'processed' });
    }
  }
});

export default router;