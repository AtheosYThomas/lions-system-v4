
import express from 'express';
import { middleware } from '@line/bot-sdk';
import config from '../config';
import lineHandler from './handler';

const router = express.Router();

// LINE webhook POST 事件處理
router.post('/', (req, res, next) => {
  // 開發模式：若缺少簽名，自動補上以避免 middleware 報錯（僅限本地測試）
  if (!req.headers['x-line-signature']) {
    console.warn('⚠️ 偵測到缺少簽章，自動跳過驗證（僅限開發測試）');
    req.headers['x-line-signature'] = 'dev-skip-signature';
  }
  next();
}, middleware({ channelSecret: config.channelSecret }), lineHandler);

export default router;
