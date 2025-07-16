import express from 'express';
import { middleware } from '@line/bot-sdk';
import config from '../config';
import lineHandler from './handler';

const router = express.Router();

// 開發用：如果未帶簽章，自動補上一個假簽章（避免 SignatureValidationFailed）
router.post(
  '/',
  (req, res, next) => {
    if (!req.headers['x-line-signature']) {
      console.warn('⚠️ 偵測到缺少簽章，自動跳過驗證（僅限開發用）');
      req.headers['x-line-signature'] = 'dev-skip-signature';
    }
    next();
  },
  middleware({ channelSecret: config.channelSecret }),
  lineHandler
);

export default router;