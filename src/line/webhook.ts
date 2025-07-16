
import express from 'express';
import { middleware } from '@line/bot-sdk';
import config from '../config';
import lineHandler from './handler';

const router = express.Router();

// LINE webhook POST 事件處理
router.post('/', 
  // 第一層：開發模式簽名處理
  (req, res, next) => {
    try {
      // 開發模式：若缺少簽名，自動補上以避免 middleware 報錯（僅限本地測試）
      if (!req.headers['x-line-signature']) {
        console.warn('⚠️ 偵測到缺少簽章，自動跳過驗證（僅限開發測試）');
        req.headers['x-line-signature'] = 'dev-skip-signature';
      }
      next();
    } catch (error) {
      console.error('🔥 簽名處理錯誤:', error);
      res.status(200).send('OK'); // 回傳 200 避免 LINE 重試
    }
  },
  
  // 第二層：LINE middleware（帶錯誤處理）
  (req, res, next) => {
    try {
      middleware({ channelSecret: config.channelSecret })(req, res, next);
    } catch (error) {
      console.error('🔥 LINE middleware 錯誤:', error);
      // 在開發模式下，跳過驗證失敗
      if (process.env.NODE_ENV !== 'production') {
        console.warn('🛠️ 開發模式：跳過 middleware 驗證錯誤');
        next();
      } else {
        res.status(200).send('OK');
      }
    }
  },
  
  // 第三層：事件處理器（帶錯誤包裝）
  async (req, res) => {
    try {
      await lineHandler(req, res);
    } catch (error) {
      console.error('🔥 Handler 錯誤:', error);
      if (!res.headersSent) {
        res.status(200).send('OK');
      }
    }
  }
);

export default router;
